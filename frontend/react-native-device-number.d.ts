declare module "react-native-device-number" {
    interface DeviceNumberModule {
        get(): Promise<string | null>;
    }

    const DeviceNumber: DeviceNumberModule;
    export default DeviceNumber;
}