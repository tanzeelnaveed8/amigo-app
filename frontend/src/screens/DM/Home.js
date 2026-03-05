import React, { useEffect, useState, useRef,useCallback } from "react";
import { Text, StyleSheet, Image, View, Dimensions, ScrollView, TouchableOpacity, SafeAreaView, FlatList, RefreshControl, TextInput, ActivityIndicator, BackHandler, ToastAndroid, Alert } from "react-native";
import Skeleton from 'react-native-reanimated-skeleton';

import { Color, FontFamily, FontSize, Border, Padding } from "../../../GlobalStyles";
import { useDispatch, useSelector } from "react-redux";
import io from 'socket.io-client'
import { setContactList, setOnlineUser, setSocketConnection, setUser, setUserData } from "../../store/slices/userSlice";
import axios from "axios";
import { basepath, baseurl } from "../../basepath";
import { setGroupData, setGroupId } from "../../store/slices/groupSlice";
import { setChanelData, setChanelId } from "../../store/slices/chanelSlice";
const { width, height } = Dimensions.get('window');
import { useFocusEffect } from '@react-navigation/native';
const Home = ({ navigation }) => {
  const user = useSelector(state => state.user)
  const socketConnection = useSelector(state => state?.user?.socketConnection)
  const [allUser, setAllUser] = useState([])
  const [unseenCout, setUnseenCoutn] = useState(0)
  const [online, setOnline] = useState([])
  const [dmTotal, setDmTotal] = useState(0)
  const [groupTotal, setGroupTotal] = useState(0)
  const [chanelTotal, setChanelTotal] = useState(0)
  const [refreshing, setRefreshing] = useState(false);
  const [contLoading, setContentLoading]=useState(false)

  // console.log({ online: online });
  const dispatch = useDispatch()
  const socketRef = useRef(null);

  
  const categoryData = [
    {
      id: 1,

      title: "All",
      smsCount: unseenCout
    },
    {
      id: 2,

      title: "Direct Messages",
      smsCount: dmTotal
    },
    {
      id: 3,

      title: "Group",
      smsCount: groupTotal
    },
    {
      id: 4,

      title: "Chanel",
      smsCount: chanelTotal
    },
  ]
  const [category, setCategory] = useState(categoryData[0])

  useEffect(() => {
    
    const getProfile = async () => {
      await axios.get(`${basepath}user/get-user-profile`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      }).then((res) => {
        dispatch(setUser(res?.data?.data))
        // console.log({ res: res.data.data });
      }).catch((err) => {
        throw err
      })
    }
    getProfile()

  }, [])

  useEffect(() => {
    const getContactList = async () => {
      await axios.get(`${basepath}user/get-user-list-of-user`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      }).then((res) => {
        dispatch(setContactList(res?.data?.data?.contactDetails))
        // console.log({ contact: res?.data?.data?.contactDetails });
      }).catch((err) => {
        throw err
      })
    }
    getContactList()

  }, [])

  useEffect(() => {
    const socket = io(baseurl, {
      auth: {
        token: user.token
      },
    })
    socketRef.current = socket;

    socket.on('onlineUser', (data) => {
      // console.log({data},'user online')
      dispatch(setOnlineUser(data))
    })

    

    dispatch(setSocketConnection(socket))

    return () => {
      socket.disconnect()
    }
  }, [])

  const fetchConversationData = useCallback(() => {
    if (socketConnection) {
      socketConnection.emit('sidebar', user._id);

      socketConnection.on('conversation', (data) => {
        // console.log({data:data[0]},'data testing');
        const conversationUserData = data?.map((conversationUser) => {
          if (conversationUser?.sender?._id === conversationUser?.receiver?._id) {
            return { ...conversationUser, userDetails: conversationUser?.sender };
          } else if (conversationUser?.receiver?._id !== user?._id) {
            return { ...conversationUser, userDetails: conversationUser.receiver };
          } else {
            return { ...conversationUser, userDetails: conversationUser.sender };
          }
        });

        const GroupTotalUnseenMessage = conversationUserData.filter((item) => item?.group !== undefined);
        const ChanelTotalUnseenMessage = conversationUserData.filter((item) => item?.chanel !== undefined);
        const dmTotalUnseenMessage = conversationUserData.filter((item) => item?.group === undefined && item.chanel === undefined);

        const totalUnseenMsg = conversationUserData.reduce((total, item) => total + item.unseenMsg, 0);
        const totalDmUnseenMessage = dmTotalUnseenMessage.reduce((total, item) => total + item.unseenMsg, 0);
        const totalGroupUnseenMessage = GroupTotalUnseenMessage.reduce((total, item) => total + item.unseenMsg, 0);
        const totalChanelUnseenMessage = ChanelTotalUnseenMessage.reduce((total, item) => total + item.unseenMsg, 0);

        setUnseenCoutn(totalUnseenMsg);
        setDmTotal(totalDmUnseenMessage);
        setGroupTotal(totalGroupUnseenMessage);
        setChanelTotal(totalChanelUnseenMessage);
        setAllUser(conversationUserData);
      });
      socketConnection.on('online-user', (data) => {
        // console.log({data},'online user');
        setOnline(data);
      });
     
    }
    
  }, [socketConnection, user]);

  
  useEffect(() => {
    fetchConversationData();

    return () => {
      socketConnection?.off('conversation');
      socketConnection?.off('online-user');
    };
  }, [fetchConversationData,socketConnection]);
  const onRefresh = () => {
    setRefreshing(true);
    fetchConversationData();
    setRefreshing(false);
  };

  useEffect(()=>{
    onRefresh()
  },[])
  // console.log({socketConnection});
const [seenCount,setSeenCount]=useState(0)

  const handleNavigate = (item, status) => {
    // console.log({ status });
    // Alert.alert(seenCount)
    let formatedDate
    // console.log({itemmmm:item.userDetails});
    if (status === 'list') {
      formatedDate = {
        _id: item.userData[0]?._id,
        firstName: item.userData[0].firstName,
        lastName: item.userData[0].lastName,
        phone: item.userData[0].phone,
        userProfile: item.userData[0].userProfile,
        conversationId: item._id,
        blockUser: item.blockUser
      }
    } else {
      formatedDate = {
        _id: item._id,
        firstName: item.firstName,
        lastName: item.lastName,
        phone: item.phone,
        userProfile: item.userProfile,
        conversationId: item._id,
        blockUser: item.blockUser
      }
    }

    dispatch(setUserData(formatedDate))

    // console.log({item:formatedDate});
    navigation.navigate('User Chat',{seenCount})
  }
  const handleNavigateGroupChat = (item) => {
    formatedDate = {
      _id: item.group._id,
      title: item.group.title,
      bio: item.group.bio,
      groupProfile: item.group.groupProfile,
      // userProfile: item.userDetails.userProfile,
      conversationId: item._id,
      blockUser: item.blockUser
    }
    dispatch(setGroupData(formatedDate))
    dispatch(setGroupId(item.group._id))
    navigation.navigate('Group Chat Box')
  }

  const handleNavigateChanelChat = (item) => {
    formatedDate = {
      _id: item.chanel._id,
      title: item.chanel.title,
      bio: item.chanel.bio,
      groupProfile: item.chanel.groupProfile,
      // userProfile: item.userDetails.userProfile,
      conversationId: item._id,
      blockUser: item.blockUser
    }
    dispatch(setChanelData(formatedDate))
    dispatch(setChanelId(item.chanel._id))
    navigation.navigate('Chanel Chat Box')
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const Item = ({ title }) => {
    console.log({ title });
    return (

      <TouchableOpacity style={styles.avatarLayout} onPress={() => handleNavigate(title, 'status')}>
        <View style={styles.imageLayout}>
          <Image
            style={[styles.frameItem, styles.frameChildLayout]}
            resizeMode="cover"
            source={{ uri: title.userProfile }}
          />
          <View
            style={styles.mditickCircle}

          />
        </View>
        <Text style={styles.ashish}>{title.firstName}</Text>
      </TouchableOpacity>
    );
  }

  const Item1 = ({ item }) => {
    // console.log({ item: item.title });
    return (
      <TouchableOpacity style={[item.title === category.title ? user.isDarkMode ? styles.activeitemdark : styles.activeitem : user.isDarkMode ? styles.itemdark : styles.itemlight, styles.comItem]} onPress={() => setCategory(item)}>
        <Text style={item.title === category.title ? styles.activeTitle : user.isDarkMode ? styles.comTitledark : styles.comTitle} >{item.title}</Text>
        <View style={item.title === category.title ? styles.activeCount : user.isDarkMode ? styles.comCountdark : styles.comCount} >
          <Text style={{ fontWeight: "600", color: "black" }} >{item?.smsCount}</Text>
        </View>
      </TouchableOpacity>
    )

  }
  const [isSearch, setIssearch] = useState(true)
  const [searchuser, setSearchUser] = useState([])
  const [searchText, setSearchText] = useState('')
  const [visibleSearch, setVisibleSearch] = useState(true)
  // console.log({searchuser:searchuser});
  const globalSearch = async () => {
    // setVisibleSearch(false)
    await axios.get(`${basepath}user/search-user?searchquery=${searchText}`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
        'Content-Type': 'application/json',
      }
    }).then((res) => {
      // console.log({ search: res.data.data.length });
      setSearchUser(res.data.data)
    }).catch((err) => {
      console.log({ err });
    })
  }

  const handleNavigateOnChat = (item) => {
    // console.log({selectUser:item});
    let formatedDate
    formatedDate = {
      _id: item._id,
      firstName: item.firstName,
      lastName: item.lastName,
      phone: item.phone,
      userProfile: item.userProfile,
    }
    dispatch(setUserData(formatedDate))
    setSearchUser([])
    setIssearch(true)
    // console.log({item:formatedDate});
    navigation.navigate('User Chat')
  }

  const filteredData = allUser?.filter((item) => {
    if (category.title === "All") return true;
    if (category.title === "Direct Messages") return item?.group === undefined && item?.chanel === undefined;
    if (category.title === "Group") return item?.group !== undefined;
    if (category.title === "Chanel") return item?.chanel !== undefined; return false;
  });

  const [backPressCount, setBackPressCount] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        if (backPressCount === 1) {
          // Exit the app if the back button is pressed twice
          BackHandler.exitApp();
          return true;
        }

        // Increment back press count on first press
        setBackPressCount(1);
        // ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);

        // Reset back press count after 2 seconds
        setTimeout(() => setBackPressCount(0), 2000);

        return true;
      };

      // Add event listener when HomeScreen is focused
      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

      // Cleanup when HomeScreen loses focus or component unmounts
      return () => backHandler.remove();
    }, [backPressCount])
  );

  return (
    <SafeAreaView style={[user.isDarkMode ? styles.frameParentdark : styles.frameParent]}
    >
      {/* section one start */}
      <View style={styles.homeTop}>
        <TouchableOpacity style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }} onPress={() => navigation.openDrawer()} >
          <Image

            resizeMode="cover"
            source={require("../../assets/group8.png")}
          />
          <Text style={styles.hiAshish}>Hi, {user?.name}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 25 }} >
          <Image
            style={styles.frameChild}
            resizeMode="cover"
            source={require("../../assets/frame-1848423.png")}
          />
        </TouchableOpacity>
      </View>
      {/* section one end */}

      <View style={{ width: "100%", paddingHorizontal: 20, paddingVertical: 5 }}>
        <Text style={{ color: "white", marginBottom: 5 }}>You Received</Text>
        <Text style={{ fontWeight: "600", fontSize: 18, color: 'white', borderBottomWidth: 1, width: 135, borderColor: 'white' }}> {unseenCout > 0 ? `${unseenCout}  Messages` : 'No Messages'} </Text>
      </View>

      {/* section 2nd start */}
      <View style={{ width: "100%", paddingHorizontal: 20, marginBottom: 20, paddingVertical: 10 }}>
        <Text style={styles.online}>{online.length > 0 ? 'Online' : 'Offline'}</Text>

        {
          online.length > 0 ?
            <FlatList
              horizontal={true}
              data={online}
              renderItem={({ item }) => <Item title={item} />}
              keyExtractor={item => item._id}
            />
            :
            <Text style={{ color: "#fff" }}>Everyone’s sleeping</Text>
        }

      </View>
      {/* section 2nd end */}


      <View
        style={[styles.frameGroup, styles.frameGroupBg]}
      >

        <View
          style={[user.isDarkMode ? styles.materialSymbolssearchParentdark : styles.materialSymbolssearchParent, styles.parentLayout]}
        >
          {/* message filter start */}
          {
            isSearch ?
              <View style={styles.serachStructure}>

                <TouchableOpacity style={styles.materialSymbolssearchIcon} onPress={() => setIssearch(!isSearch)}>
                  <Image
                    style={user.isDarkMode && { tintColor: '#fff' }}
                    resizeMode="cover"
                    source={require("../../assets/materialsymbolssearch.png")}
                  />
                </TouchableOpacity>
                <View style={{ width: "90%", paddingLeft: 10 }}>
                  <FlatList
                    horizontal={true}
                    data={categoryData}
                    renderItem={({ item }) => <Item1 item={item} />}
                    keyExtractor={item => item.id}
                  />
                </View>

              </View>
              :
              <View style={{ flexDirection: "row", height: 60, justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
                <View style={{ width: "80%", position: "relative" }}>

                  <TextInput placeholder="search here ..."
                    onChangeText={(txt) => setSearchText(txt)}
                    style={user.isDarkMode ?
                      { borderColor: "#fff", borderWidth: 1, borderRadius: 30, paddingHorizontal: 20, color: "#fff" }
                      :
                      { borderWidth: 1, borderColor: '#000', borderRadius: 30, paddingHorizontal: 20 }
                    }
                    placeholderTextColor={user.isDarkMode ? 'white' : 'gray'}
                  />
                  <TouchableOpacity style={{ position: "absolute", top: 10, right: 15 }} onPress={globalSearch} >
                    <Image source={require('../../assets/search.png')} style={{ height: 30, width: 30, tintColor: "gray" }} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => { setIssearch(!isSearch); setSearchUser([]) }} style={{ width: '15%' }} >
                  <Image source={require('../../assets/iconoircancel.png')} style={{ height: 40, width: 40 }} />
                </TouchableOpacity>
              </View>
          }

          {/* message filter end */}

          <ScrollView style={styles.messageData}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >

            {searchuser?.length <= 0 ?
              allUser?.length > 0 ?
                allUser?.filter((item) => {
                  if (category.title === "All") return true;
                  if (category.title === "Direct Messages") return item?.group === undefined && item?.chanel === undefined;
                  if (category.title === "Group") return item?.group !== undefined;
                  if (category.title === "Chanel") return item?.chanel !== undefined; return false;
                })?.map((item, index) => {
                  // console.log({ item:item},'user');
                  return (

                    <TouchableOpacity key={index}

                      onPress={() => {
                        if (item?.group === undefined && item?.chanel === undefined) {
                          {handleNavigate(item, 'list'),setSeenCount(item?.unseenMsg)}
                        } else if (item?.group) {
                          handleNavigateGroupChat(item);
                        } else if (item?.chanel) {
                          handleNavigateChanelChat(item);
                        }
                      }}
                    >
                      <View style={styles.messageStructure}>
                        <View style={styles.userStructure}>
                          <View style={styles.avatarImg}>
                            <Image
                              style={{ height: 45, width: 45, borderColor: "#9B7BFF", borderWidth: 1, borderRadius: 30 }}
                              resizeMode="cover"
                              source={{
                                uri:
                                  item?.group === undefined && item?.chanel === undefined ? item?.userData[0]?.userProfile
                                    : item?.group ? item?.group?.groupProfile : item?.chanel ? item?.chanel.chanelProfile : ''
                              }}
                            />

                          </View>
                          <View style={styles.nameLayout}>
                            <Text
                              style={[styles.ashishRajput, user.isDarkMode ? styles.ashishRajputdark : styles.ashishTypo]}
                            >
                              {/* {item?.group === undefined ? item?.userData[0]?.firstName : item?.group?.title } */}
                              {
                                item?.group === undefined && item?.chanel === undefined
                                  ? item?.userData[0]?.firstName
                                  : item?.group
                                    ? item?.group?.title
                                    : item?.chanel
                                      ? item?.chanel?.title
                                      : ''
                              }

                              {/* {`${item?.userDetails?.firstName}`} */}
                            </Text>
                            <Text
                              style={[user.isDarkMode ? { color: "#fff" } : { color: "black" }]}
                            >
                              {
                                item?.lastMsg?.text !== undefined ?
                                  `${(item?.lastMsg?.text)?.substring(0, 20)}...`
                                  :
                                  'Chat Cleared'
                              }</Text>
                          </View>
                        </View>
                        <View style={styles.timeLayout}>
                          <Text
                            style={[user.isDarkMode ? { color: "#fff" } : { color: "black" }]}
                          >{item?.lastMsg?.updatedAt !== undefined ?

                            formatTime(item?.lastMsg?.updatedAt)
                            :
                            formatTime(new Date())
                            }</Text>

                          {
                            item?.unseenMsg > 0 ? 
                            <Text style={[{
                              color: "#fff",
                              backgroundColor: "#9B7BFF",
                              height: 20,
                              width: 20,
                              borderRadius: 30,

                              textAlign: "center"
                            }]}>{item?.unseenMsg}</Text> 
                            
                            :

                            item?.lastMsg.msgByUserId === user._id ?

                            item.lastMsg.seen ?

                              <Image
                                style={{ tintColor: "#027FFF", width: 18, height: 8 }}
                                resizeMode="cover"
                                source={require("../../assets/vector11.png")}
                              />
                              :
                              <Image
                                style={{ tintColor: "gray", width: 18, height: 8 }}
                                resizeMode="cover"
                                source={require("../../assets/mdi_tick.png")}
                              />
                              :
                              ""
                          }
                        </View>
                      </View>
                    </TouchableOpacity>

                  )
                })
                :
                <View style={{ flexDirection: "column", justifyContent: "center", width: "100%", alignItems: "center" }} >
                  <Image source={require("../../assets/img.png")} style={{ width: 170, height: 170 }} />
                  <Text style={{ fontSize: 18, fontWeight: "700", color: user.isDarkMode ? "#fff" : "black", marginVertical: 30 }} >No Message yet.</Text>
                </View>
              :
              searchuser.length > 0 ?
                searchuser.map((item, index) => {
                  return (
                    <TouchableOpacity key={index}
                      style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "center", marginBottom: 15 }}
                      onPress={() => handleNavigateOnChat(item)}
                    >
                      <View style={{ borderWidth: 1, borderColor: "#000", borderRadius: 30, marginRight: 10 }}>
                        <Image source={{ uri: item.userProfile }} style={[user.isDarkMode && { borderWidth: 1, borderColor: "#fff", borderRadius: 30 }, { height: 50, width: 50 }]} />
                      </View>
                      <Text style={[user.isDarkMode ? { color: "white" } : { color: "#000" }, { fontSize: 18, fontWeight: "600" }]} >{item.firstName + " " + item.lastName}</Text>
                    </TouchableOpacity>
                  )
                })

                :
                <ActivityIndicator size='large' color="#0000" />
            }
            {
              allUser.length <= 0 &&
              <View style={{ width: "100%", flexDirection: "row", justifyContent: "center" }} >
                <TouchableOpacity style={styles.letsstart} onPress={() => navigation.navigate('New Message')}>
                  <Text style={{ color: "white", fontSize: 18, fontWeight: '600' }} >Let’s Start</Text>
                </TouchableOpacity>
              </View>
            }

          </ScrollView>
          {
            allUser.length > 0 &&
            <TouchableOpacity style={styles.floating} onPress={() => navigation.navigate('New Message')} >
              <Image source={require('../../assets/icbaselineplus3.png')} style={{ height: 40, width: 40 }} />
            </TouchableOpacity>
          }

        </View>

      </View>
    </SafeAreaView>
  );
};

const vw = width / 100;
const vh = height / 100;

const styles = StyleSheet.create({
  letsstart: {
    backgroundColor: '#9B7BFF',
    width: 200,
    marginTop: 40,
    height: 50,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center", alignItems: "center"
  },
  floating: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: '#9B7BFF',
    width: 50,
    height: 50,
    borderRadius: 40,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: 'center'
  },
  homeTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
    height: 50,
    paddingTop: 10,
    // backgroundColor:"black",
    paddingHorizontal: 20,
    // paddingHorizontal:5
  },
  activeitem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    width: 'auto',
    backgroundColor: 'black'
  },
  activeitemdark: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    width: 'auto',
    backgroundColor: '#027FFF'
  },
  comItem: {
    paddingHorizontal: 20,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    width: 'auto',
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 5,
    paddingBottom: 2,
    height: 40
  },
  activeTitle: {
    color: "white",
    paddingRight: 20,
    fontWeight: "600"
  },
  comTitle: {
    paddingRight: 20,
    fontWeight: "600",
    color: "black"
  },
  comTitledark: {
    paddingRight: 20,
    fontWeight: "600",
    color: "#fff"
  },
  activeCount: {
    backgroundColor: "white",
    borderRadius: 30,
    paddingHorizontal: 6,

  },
  comCount: {
    backgroundColor: "#E8E8F0",
    borderRadius: 30,
    paddingHorizontal: 6,
  },
  comCountdark: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 30,
    paddingHorizontal: 6,
  },
  itemlight: {
    borderColor: "#ccc",
  },
  itemdark: {
    borderColor: "rgba(255,255,255,0.3)",
  },
  ScrollView: {
    marginVertical: 40
  },
  frameGroupBg: {
    // backgroundColor: Color.colorWhite,
    // overflow: "hidden",
    // position: "absolute",
    flex: 1,
    height: '100%'
  },
  searchLayout: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitle: {
    flex: 1,
    flexDirection: 'row'
  },
  avatarImg: {
    position: 'relative',
  },
  messageStructure: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25
  },
  stickyLayout: {
    // position: 'absolute',
    bottom: 0,
    left: 1 * vh,
    paddingHorizontal: 1 * vh,
    paddingVertical: 1 * vh,
    width: '100%',
  },
  timeLayout: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  blueText: {
    backgroundColor: Color.colorDeepskyblue_100,
    color: Color.colorWhite,
    paddingHorizontal: 2 * vw,
    paddingVertical: 0.5 * vh,
    borderRadius: Border.br_31xl,
    fontSize: FontSize.size_3xs,
  },
  marginCard: {
    marginVertical: 2 * vh,
  }
  ,
  msgText: {
    color: Color.colorWhite,

  },
  nameLayout: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    marginLeft: 2 * vh,
  },
  textNumber: {
    color: Color.colorBlack,
  },
  serachStructure: {
    // display: 'flex',
    flexDirection: 'row',
    justifyContent: "flex-start",
    alignItems: 'center',
    width: "100%",
    marginBottom: 20
  },
  userStructure: {
    display: 'flex',
    flexDirection: 'row',
  },
  msgNumber: {
    backgroundColor: Color.colorWhite,
    height: 2 * vh,
    paddingHorizontal: 1 * vh,
    // paddingVertical:0.1*vh,
    borderRadius: Border.br_31xl,
    marginLeft: 1 * vh,
    //color:Color.colorBlack,
    //padding:1*vh,
  },
  msgBg: {
    backgroundColor: Color.colorBlack,
    paddingVertical: 1 * vh,
    paddingHorizontal: 2 * vh,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: "space-between",
    alignItems: 'center',
    borderRadius: Border.br_11xl

  },
  headerLayout: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 15,
    // borderWidth:5,
    // borderColor:Color.colorRed,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  allImages: {
    display: 'flex',
    flexDirection: 'row',


  },
  parentLayout: {
    // width: 375,
    //left: 0,
    //width: 100 * vw,
    width: '100%',
    //position: 'relative',

  },
  avatarLayout: {
    display: 'flex',
    flexDirection: 'column',
    marginRight: 5 * vw,
  },
  imageLayout: {
    position: 'relative',
  },
  frameChildLayout: {
    height: 50,
    width: 50,
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 30

  },
  iconLayout1: {
    // overflow: "hidden",

    position: "absolute",
    height: 18,
    width: 18,
    borderRadius: Border.br_17xl,
  },
  ashishTypo1: {
    fontFamily: FontFamily.nunitoBold,
    fontWeight: "700",
    width: 39,
    fontSize: FontSize.size_xs,
    top: 242,
    textAlign: "left",
    color: Color.colorWhite,
    position: "absolute",
  },
  ellipseIconLayout: {
    height: 20,
    position: "absolute",
  },
  iconLayout: {
    width: 22,
    height: 20,
    overflow: "hidden",
    top: 0,
    position: "absolute",
  },
  frameItemPosition: {
    left: 25,
    position: "absolute",
  },
  textTypo: {
    // textAlign: "center",
    fontFamily: FontFamily.nunitoBold,
    fontWeight: "700",
    // position: "absolute",

  },
  messageTypo: {
    color: Color.colorGray_1400,
    fontFamily: FontFamily.nunitoSemiBold,
    textAlign: "left",
    fontWeight: "600",
    fontSize: FontSize.size_lg,
    marginVertical: 2 * vh,
  },
  frameChildPosition1: {
    left: 21,
    position: "absolute",
  },
  frameChildPosition: {
    left: 23,
    height: 50,
    width: 50,
    position: "absolute",
  },
  ashishTypo: {
    //width: 144,
    color: Color.colorDimgray_500,
    fontFamily: FontFamily.nunitoBold,
    fontWeight: "700",
    textAlign: "left",
    fontSize: FontSize.size_lg,
    // position: "absolute",
  },
  ashishRajputdark: {
    fontFamily: FontFamily.nunitoBold,
    fontWeight: "700",
    textAlign: "left",
    fontSize: FontSize.size_lg,
    color: "#fff"
  },
  heyTypo: {
    color: Color.colorDimgray_400,
    fontFamily: FontFamily.nunitoMedium,
    textAlign: "center",
    fontSize: FontSize.size_xs,
    fontWeight: "500",
    position: "absolute",
  },
  amTypo: {
    color: Color.colorDimgray_200,
    fontFamily: FontFamily.nunitoMedium,
    textAlign: "center",
    fontSize: FontSize.size_3xs,
    fontWeight: "500",
    position: "absolute",
  },

  vectorIconLayout: {
    left: "91.73%",
    right: "5.07%",
    width: "3.2%",
    height: "0.95%",
    maxHeight: "100%",
    maxWidth: "100%",
    overflow: "hidden",
    position: "absolute",
  },
  mditickIconLayout: {
    height: 18,
    width: 18,
    borderRadius: Border.br_17xl,
    bottom: 0,
    position: "absolute",
    right: 0,
  },
  youReceived: {
    //top: 70,
    // textAlign: "left",
    fontFamily: FontFamily.interRegular,
    fontSize: FontSize.size_lg,
    //left: 19,
    color: Color.colorWhite,
    //position: "absolute",
    marginVertical: 1 * vh,
  },
  messages: {
    // top: 98,
    fontSize: FontSize.size_3xl,
    textDecoration: "underline",
    fontFamily: FontFamily.interSemiBold,
    fontWeight: "600",
    textAlign: "left",
    color: Color.colorWhite,
    textDecorationLine: 'underline'
    //  left: 19,
    // position: "absolute",
  },
  frameChild: {
    // top: 47,
    borderRadius: Border.br_21xl,
    width: 40,
    height: 40,

  },
  online: {
    // top: 150,
    fontFamily: FontFamily.interMedium,
    fontWeight: "500",
    fontSize: FontSize.size_mini,
    textAlign: "left",
    color: Color.colorWhite,
    marginVertical: 1 * vh,
    //  left: 19,
    // position: "absolute",
  },
  frameItem: {
    // left: 25,
    // position: "absolute",
    // top: 185,
    //  width: 50,
  },
  mditickCircle: {
    // left: 60,
    width: 18,
    borderRadius: Border.br_17xl,
    // height: 18,
    borderWidth: 2,
    borderColor: Color.colorBlack,
    borderStyle: "solid",
    backgroundColor: Color.colorSpringgreen,
    position: 'absolute',
    right: 0,
    bottom: 0,
    position: "absolute",
    height: 18,
    width: 18,
    borderRadius: Border.br_17xl,

    // top: 216,
  },
  frameInner: {
    left: 100,
    top: 185,
    width: 50,
    position: "absolute",
  },
  mditickCircle1: {
    position: "absolute",
    height: 18,
    width: 18,
    borderRadius: Border.br_17xl,
    width: 18,
    borderRadius: Border.br_17xl,
    // height: 18,
    borderWidth: 2,
    // borderColor: Color.colorBlack,
    borderStyle: "solid",
    backgroundColor: Color.colorGold,
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  groupIcon: {
    left: 175,
    top: 185,
    width: 50,
    position: "absolute",
  },
  mditickCircle2: {

    width: 18,
    borderRadius: Border.br_17xl,
    // height: 18,
    borderWidth: 2,
    borderColor: Color.colorBlack,
    borderStyle: "solid",
    backgroundColor: Color.colorRed,
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  frameChild1: {
    left: 250,
    top: 185,
    width: 50,
    position: "absolute",
  },
  mditickCircle3: {
    left: 285,
    width: 18,
    borderRadius: Border.br_17xl,
    height: 18,
    borderWidth: 2,
    borderColor: Color.colorBlack,
    borderStyle: "solid",
    backgroundColor: Color.colorSpringgreen,
    top: 216,
  },
  frameChild2: {
    left: 325,
    top: 185,
    width: 50,
    position: "absolute",
  },
  ashish: {
    // left: 30,
    fontWeight: "800",
    fontFamily: FontFamily.nunitoExtraBold,
    // width: 39,
    // top: 242,
    fontSize: FontSize.size_mini,
    // textAlign: "left",
    color: Color.colorWhite,
    // position: "absolute",
    marginTop: 1 * vh,
  },
  ashish1: {
    left: 106,
  },
  ashish2: {
    left: 182,
  },
  ashish3: {
    left: 256,
  },
  ashish4: {
    left: 332,
  },
  noti: {
    backgroundColor: Color.colorBlack,
    height: 28,
    overflow: "hidden",
    top: 0,
    width: 375,
    position: "absolute",
  },
  signal1Icon: {
    left: 270,
  },
  fullBattery1Icon: {
    left: 294,
  },
  pm: {
    top: 2,
    lineHeight: 15,
    width: 51,
    fontSize: FontSize.size_3xs,
    fontFamily: FontFamily.interSemiBold,
    fontWeight: "600",
    textAlign: "left",
    color: Color.colorWhite,
    left: 0,
    position: "absolute",
  },
  signal1Parent: {
    top: 4,
    left: 29,
    width: 317,
  },
  hiAshish: {
    // top: 46,
    // left: 46,
    fontSize: FontSize.size_sm,
    textAlign: "left",
    color: Color.colorWhite,
    fontFamily: FontFamily.interRegular,
    // position: "absolute",
    marginLeft: 2 * vw,
  },

  mditickCircle4: {
    top: 217,
    left: 356,
    width: 18,
    borderRadius: Border.br_17xl,
    height: 18,
    borderWidth: 2,
    borderColor: Color.colorBlack,
    borderStyle: "solid",
    backgroundColor: Color.colorSpringgreen,
  },
  youReceivedParent: {
    paddingHorizontal: 4 * vw,
    paddingTop: 5 * vw,
    paddingBottom: 5 * vw,
    display: 'flex',
    // borderWidth:5,
    // borderColor:Color.colorRed,
    width: '100%',

  },
  materialSymbolssearchIcon: {
    width: "10%"
  },
  ellipseIcon: {
    top: 222,
    left: 334,
    width: 20,
  },
  text: {
    left: 339,
    fontSize: FontSize.size_sm,
    textAlign: "center",
    top: 223,
    color: Color.colorWhite,
  },
  group: {
    // top: 28,
    // left: 266,
    color: Color.colorGray_1300,
    textAlign: "center",
    fontSize: FontSize.size_mini,
    marginRight: 1 * vh,
  },
  text1: {
    // top: 29,
    // left: 324,
    color: Color.colorBlack,
    fontSize: FontSize.size_sm,
    textAlign: "center",
  },
  pinnedMessage2: {
    // top: 87,
    // left: 17,
    // position: "absolute",
  },
  allMessage8: {
    top: 275,
    color: Color.colorGray_1400,
    fontFamily: FontFamily.nunitoSemiBold,
    textAlign: "center",
    fontWeight: "600",
    fontSize: FontSize.size_lg,
  },
  frameChild3: {
    top: 124,
    height: 50,
    width: 50,
  },
  frameChild4: {
    top: 314,
    height: 50,
    width: 50,
  },
  frameChild5: {
    top: 384,
  },
  frameChild6: {
    top: 456,
  },
  frameChild7: {
    top: 194,
    height: 50,
    width: 50,
  },
  ashishRajput: {
    // top: 126,
    // left: 92,
  },
  ashishRajput1: {
    top: 316,
    left: 92,
  },
  ashishRajput2: {
    top: 386,
    left: 94,
  },
  ashishRajput3: {
    top: 458,
    left: 94,
  },
  ashishRajput4: {
    top: 196,
    left: 92,
  },
  heyThere: {
    top: 153,
    left: 92,
  },
  heyThere1: {
    top: 343,
    left: 92,
  },
  heyThere2: {
    top: 413,
    left: 94,
  },
  heyThere3: {
    top: 485,
    left: 94,
  },
  heyThere4: {
    left: 92,
    top: 223,
  },
  am: {
    top: 132,
    left: 311,
    color: Color.colorDimgray_200,
  },
  am1: {
    top: 322,
    left: 311,
    color: Color.colorDimgray_200,
  },
  am2: {
    top: 392,
    left: 313,
  },
  am3: {
    top: 464,
    left: 313,
  },
  am4: {
    top: 202,
    left: 311,
    color: Color.colorDimgray_200,
  },
  vectorIcon: {
    // top: "30.61%",
    // bottom: "68.44%",
  },
  vectorIcon1: {
    top: "66.73%",
    bottom: "32.32%",
  },
  vectorIcon2: {
    top: "80.04%",
    bottom: "19.01%",
  },
  vectorIcon3: {
    top: "93.73%",
    bottom: "5.32%",
  },
  mditickCircleIcon: {
    // top: 156,
  },
  mditickCircleIcon1: {
    top: 346,
  },
  mditickCircleIcon2: {
    top: 416,
    left: 57,
    width: 18,
    borderRadius: Border.br_17xl,
    height: 18,
  },
  frameChild8: {
    // top: 438,
    // left: 299,
    width: 60,
    height: 60,
    //position: "absolute",
    bottom: 0,
    position: 'fixed',
    //right:3, 
    marginLeft: 'auto',
    top: 1,
  },
  icbaselinePlusIcon: {
    // top: 455,
    //left: 316,
    width: 26,
    height: 26,
    // overflow: "hidden",
    // position: "absolute",
    // backgroundColor: Color.colorCornflowerblue_100,
    // bottom: 0,
    //right: 3,
    position: 'absolute',
    borderRadius: Border.br_31xl,
    // paddingHorizontal:1*vh,
    // paddingVertical:1*vh,
    zIndex: 15,
    // borderWidth:2,
    // borderColor:Color.colorSpringgreen,
    right: 3 * vh,
    top: 3 * vh,

  },
  frameIcon: {
    top: 508,
    width: 375,
    left: 0,
  },
  materialSymbolssearchParent: {
    // top: 268,
    borderTopLeftRadius: Border.br_16xl,
    borderTopRightRadius: Border.br_16xl,
    // height: 526,
    overflow: "hidden",
    backgroundColor: Color.colorWhite,
    height: '100%',
    paddingHorizontal: 3 * vh,
    paddingTop: 3 * vh,
    position: 'relative',
    width: "100%"
    // position: "absolute",
  },
  materialSymbolssearchParentdark: {
    borderTopLeftRadius: Border.br_16xl,
    borderTopRightRadius: Border.br_16xl,
    overflow: "hidden",
    backgroundColor: 'black',
    height: '100%',
    paddingHorizontal: 3 * vh,
    paddingTop: 3 * vh,
    position: 'relative',
    width: "100%"
  },
  frameGroup: {
    // borderRadius: Border.br_16xl,
    // width: 373,
    // overflow: "hidden",
    height: '100%',
    //backgroundColor: Color.colorBlack,

    // height: 780,
    flex: 1,
  },
  frameParent: {
    flex: 1,
    backgroundColor: Color.colorCornflowerblue_100
    //width: "100%",
    // height: 780,
  },
  frameParentdark: {
    backgroundColor: "#0D142E",
    flex: 1,

  }
});

export default Home;
