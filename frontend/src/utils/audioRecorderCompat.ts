import { Audio } from 'expo-av';

class AudioRecorderPlayer {
  private recording: Audio.Recording | null = null;
  private sound: Audio.Sound | null = null;
  private recordBackListener: ((data: any) => void) | null = null;
  private playBackListener: ((data: any) => void) | null = null;
  private playbackInterval: any = null;
  private isRecordingPaused = false;

  async startRecorder(path?: string) {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const {recording} = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      this.recording = recording;
      this.isRecordingPaused = false;

      if (this.recordBackListener) {
        const startTime = Date.now();
        this.playbackInterval = setInterval(async () => {
          if (this.recording) {
            const status = await this.recording.getStatusAsync();
            if (status.isRecording && this.recordBackListener) {
              this.recordBackListener({
                currentPosition: status.durationMillis || 0,
                currentMetering: status.metering || 0,
              });
            }
          }
        }, 100);
      }

      return path || 'recording';
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  async stopRecorder() {
    try {
      if (this.playbackInterval) {
        clearInterval(this.playbackInterval);
        this.playbackInterval = null;
      }

      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({allowsRecordingIOS: false});
        const uri = this.recording.getURI();
        this.recording = null;
        this.isRecordingPaused = false;
        return uri || '';
      }
      return '';
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw error;
    }
  }

  async startPlayer(uri?: string) {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      const {sound} = await Audio.Sound.createAsync(
        {uri: uri || ''},
        {shouldPlay: true},
      );
      this.sound = sound;

      if (this.playBackListener) {
        sound.setOnPlaybackStatusUpdate(status => {
          if (status.isLoaded && this.playBackListener) {
            this.playBackListener({
              currentPosition: status.positionMillis || 0,
              duration: status.durationMillis || 0,
              isFinished: status.didJustFinish || false,
            });
          }
        });
      }

      return uri || '';
    } catch (error) {
      console.error('Failed to start player:', error);
      throw error;
    }
  }

  async stopPlayer() {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      }
    } catch (error) {
      console.error('Failed to stop player:', error);
    }
  }

  async pausePlayer() {
    if (this.sound) {
      await this.sound.pauseAsync();
    }
  }

  async resumePlayer() {
    if (this.sound) {
      await this.sound.playAsync();
    }
  }

  async pauseRecorder() {
    if (!this.recording || this.isRecordingPaused) return;
    try {
      await this.recording.pauseAsync();
      this.isRecordingPaused = true;
    } catch (error) {
      console.error('Failed to pause recording:', error);
      throw error;
    }
  }

  async resumeRecorder() {
    if (!this.recording || !this.isRecordingPaused) return;
    try {
      await this.recording.startAsync();
      this.isRecordingPaused = false;
    } catch (error) {
      console.error('Failed to resume recording:', error);
      throw error;
    }
  }

  addRecordBackListener(callback: (data: any) => void) {
    this.recordBackListener = callback;
  }

  addPlayBackListener(callback: (data: any) => void) {
    this.playBackListener = callback;
  }

  removeRecordBackListener() {
    this.recordBackListener = null;
  }

  removePlayBackListener() {
    this.playBackListener = null;
    if (this.sound) {
      this.sound.setOnPlaybackStatusUpdate(null);
    }
  }
}

export default AudioRecorderPlayer;
