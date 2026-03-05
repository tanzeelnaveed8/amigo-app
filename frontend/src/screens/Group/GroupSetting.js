import React, { useEffect, useState } from 'react'
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Switch } from 'react-native'
import { useSelector } from 'react-redux'

const GroupSetting = ({ navigation }) => {
    const group = useSelector(state => state.group)
  const user = useSelector(state => state.user)
    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);
    const groupData = [
        {
            title: "Private Group",
            des: "When your account is private. Nobody can add you in any Private Group or channel."
        },
        {
            title: "Public Group",
            des: "When your account is private. Nobody can add you in any Public Group or channel."
        }
    ]
    const [data, setData] = useState(groupData[0])
    useEffect(()=>{

    },[group])
    return (
        <SafeAreaView style={[styles.container, user.isDarkMode && { backgroundColor: "#0D142E" }]} >
            <View style={styles.top} >
                <TouchableOpacity onPress={() => navigation.goBack()} >
                    <Image source={require('../../assets/left.png')} style={{ height: 30, width: 35 }} />
                </TouchableOpacity>
                <Text style={{ fontSize: 18, fontWeight: "700", color: "white" }} >Group Settings</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Group Contact List')} >
                    <Image source={require("../../assets/mdi_tick.png")} style={{ height: 30, width: 35 }} />
                </TouchableOpacity>
            </View>

            <View style={styles.itemContainer}>
                {
                    groupData.map((item, index) => {
                        return (
                            <TouchableOpacity key={index} style={[item.title === data.title ? styles.selected : styles.deselected, styles.comItem]} onPress={() => setData(item)} >
                                {
                                    index === 0 && (<Image source={require("../../assets/private.png")} style={styles.floatImg} />)
                                }
                                <Image source={require("../../assets/groupIcons.png")} style={[item.title === data.title ? styles.selectedImg : styles.deselectedImg, styles.comImg]} />
                                <Text style={[item.title === data.title && styles.activetitle, { marginTop: 10, fontWeight: "600" }]} >{item.title}</Text>
                            </TouchableOpacity>
                        )
                    })
                }
            </View>

            <View style={{ width: "100%", paddingHorizontal: 40 }} >
                {data.title === 'Private Group' ? <Text style={styles.desText} >{groupData[0].des}</Text> : <Text style={styles.desText} >{groupData[1].des}</Text>}
            </View>

            <View style={{width:"100%",paddingHorizontal:20,paddingTop:20}} >
                <View style={styles.setting} >
                    <View style={styles.setting1}>
                        <Image source={require('../../assets/belll.png')} style={{ height: 30, width: 30, tintColor: "#fff" }} />
                        <Text style={{ color: "white", fontWeight: "600", fontSize: 14,paddingLeft:10 }}>Notifications </Text>
                    </View>
                
                    <View style={styles.setting3}>
                        <Switch
                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                            thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={toggleSwitch}
                            value={isEnabled}
                        />
                    </View>
                </View>
                <View style={styles.setting} >
                    <TouchableOpacity style={styles.setting1} onPress={()=>navigation.navigate('Add Member In Group')} >
                        <Image source={require('../../assets/grp.png')} style={{ height: 30, width: 30, tintColor: "#fff" }} />
                        <Text style={{ color: "white", fontWeight: "600", fontSize: 14,paddingLeft:10 }}>Add members</Text>
                    </TouchableOpacity>
                    <View>
                       
                    </View>
                </View>
                <View style={styles.setting} >
                    <TouchableOpacity style={styles.setting1} onPress={()=>navigation.navigate('Group Admin')} >
                        <Image source={require('../../assets/admin.png')} style={{ height: 30, width: 30, tintColor: "#fff" }} />
                        <Text style={{ color: "white", fontWeight: "600", fontSize: 14,paddingLeft:10 }}>Admins</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.setting3}>
                        
                    </View>
                </View>
            </View>




        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: "100%",
        backgroundColor: '#009cf4',
    },
    top: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        paddingHorizontal: 20,
        height: 100
    },
    itemContainer: {
        flexDirection: "row",
        width: "100%",
        paddingHorizontal: 20,
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 40
    },
    comItem: {

        borderRadius: 20,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
    },
    deselected: {
        backgroundColor: "white",
        width: "40%",
        height: 120
    },
    selected: {
        backgroundColor: '#9B7BFF',
        width: "50%",
        height: 150,
    },
    comImg: {
        height: 50, width: 70,
    },
    deselectedImg: {
        tintColor: "#8E9598"
    },
    activetitle: {
        color: "white"
    },
    floatImg: {
        position: "absolute",
        top: 15,
        right: 25,
        height: 30,
        width: 30,
        tintColor: 'white'
    },
    desText: {
        color: "white",
        paddingHorizontal: 20,
        textAlign: "center",
        lineHeight: 20,
        fontSize: 14
    },
    setting:{
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
        width:"100%",
        marginBottom:15
      },
      setting1:{
        flexDirection:"row",
        justifyContent:"flex-start",
        alignItems:"center"
      }
})
export default GroupSetting