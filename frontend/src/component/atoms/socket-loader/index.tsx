import React from 'react';
import { View, ActivityIndicator, Modal } from 'react-native';
import RNText from '../text';
import { useContext } from 'react';
import Context from '../../../context';
import fontSize from '../../../constants/font-size';
import fontWeight from '../../../constants/font-weight';

interface SocketLoaderProps {
    visible: boolean;
}

const SocketLoader: React.FC<SocketLoaderProps> = ({ visible }) => {
    const { colors } = useContext(Context);

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
        >
            <View style={{
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <View style={{
                    backgroundColor: colors.white,
                    padding: 30,
                    borderRadius: 10,
                    alignItems: 'center',
                    minWidth: 200,
                }}>
                    <ActivityIndicator 
                        size="large" 
                        color={colors.primary} 
                        style={{ marginBottom: 15 }}
                    />
                    <RNText 
                        label="Connecting to server..." 
                        fontSize={fontSize._16} 
                        fontWeight={fontWeight._600} 
                        color={colors.textColor}
                        textAlign="center"
                    />
                    <View style={{ marginTop: 5 }}>
                        <RNText 
                            label="Please wait while we establish connection" 
                            fontSize={fontSize._12} 
                            fontWeight={fontWeight._400} 
                            color={colors.grey}
                            textAlign="center"
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default SocketLoader;
