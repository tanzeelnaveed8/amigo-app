import { Audio } from 'expo-av';

class Sound {
  static MAIN_BUNDLE = 'MAIN_BUNDLE';
  
  private sound: Audio.Sound | null = null;
  private loaded = false;

  constructor(
    filename: string,
    _basePath: string,
    onError?: (error: any) => void,
  ) {
    this.loadSound(filename).then(() => {
      if (onError) onError(null);
    }).catch(err => {
      if (onError) onError(err);
    });
  }

  private async loadSound(filename: string) {
    try {
      const {sound} = await Audio.Sound.createAsync(
        {uri: filename},
        {shouldPlay: false},
      );
      this.sound = sound;
      this.loaded = true;
    } catch (error) {
      console.log('Sound load error:', error);
    }
  }

  play(onEnd?: () => void) {
    if (this.sound && this.loaded) {
      this.sound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded && status.didJustFinish && onEnd) {
          onEnd();
        }
      });
      this.sound.replayAsync().catch(console.error);
    }
    return this;
  }

  stop() {
    if (this.sound) {
      this.sound.stopAsync().catch(console.error);
    }
    return this;
  }

  release() {
    if (this.sound) {
      this.sound.unloadAsync().catch(console.error);
      this.sound = null;
    }
  }

  setVolume(volume: number) {
    if (this.sound) {
      this.sound.setVolumeAsync(volume).catch(console.error);
    }
    return this;
  }
}

export default Sound;
