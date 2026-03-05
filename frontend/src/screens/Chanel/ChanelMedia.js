import React, { useState } from 'react'
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, FlatList, ScrollView } from 'react-native'

const ChanelMedia = ({navigation}) => {
  const galleryData = [
    {
      path: "../../assets/image1.png",
      title: 'All Media'
    },
    {
      path: "../../assets/image2.png",
      title: 'Camera'
    },
    {
      path: "../../assets/image3.png",
      title: 'Downloads'
    },
    {
      path: "../../assets/image4.png",
      title: 'Recent'
    },
    {
      path: "../../assets/image5.png",
      title: 'All Media'
    },
    {
      path: "../../assets/image6.png",
      title: 'All Media'
    }
  ]
  const mediaData = [
    {
      id: 1,
      title: "Videos",
      docCount: 5
    },
    {
      id: 2,
      title: "Images",
      docCount: 5
    },
    {
      id: 3,
      title: "Files",
      docCount: 5
    },
    {
      id: 4,
      title: "Links",
      docCount: 5
    }
  ]
  const [data, setData] = useState(mediaData[0])
  const Item = ({ item }) => {
    // console.log({ item });
    return (
      <TouchableOpacity style={[item.title === data.title ? styles.ActiveItem : styles.item, styles.comItem]} onPress={() => setData(item)} >

        <Text style={item.title === data.title ? styles.ActiveTitle : styles.Title} >{item.title}</Text>
        <View style={styles.count} >
          <Text style={{ color: '' }} >{item.docCount}</Text>
        </View>

      </TouchableOpacity>
    )
  }
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.top} onPress={() => navigation.goBack()} >
        <Image source={require('../../assets/left.png')} style={{ height: 30, width: 35 }} />
      </TouchableOpacity>
      <View style={styles.renderItem} >
        <FlatList
          horizontal={true}
          data={mediaData}
          renderItem={({ item }) => <Item item={item} />}
          keyExtractor={item => item.id}
        />
      </View>
      <ScrollView  >
        <View style={styles.galleryContainer}>


          {
            galleryData.map((item, index) => {
              // console.log({item:item.path});
              return (
                <TouchableOpacity key={index} style={styles.gallerItem} >
                  <Image source={require("../../assets/image1.png")} style={{height:190,width:150,borderRadius:20}} />
                  <Text style={{fontSize:18, fontWeight:"600", color:"white",textAlign:"center"}} >{item.title}</Text>
                </TouchableOpacity>
              )
            })
          }
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#009cf4',
    height: '100%',
    width: '100%',
    flex: 1
  },
  renderItem: {
    width: '100%',
    paddingHorizontal: 20
  },
  top: {
    width: "100%",
    paddingHorizontal: 20,
    marginVertical: 10
  },
  comItem: {
    width: 'auto',
    flexDirection: "row",
    justifyContent: "flex-start",
    marginRight: 8
  },
  count: {
    backgroundColor: '#A9D3FF',
    borderRadius: 20,
    paddingHorizontal: 6
  },
  ActiveItem: {
    backgroundColor: '#000000BF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20
  },
  item: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white'
  },
  ActiveTitle: {
    color: 'white',
    marginRight: 10
  },
  Title: {
    marginRight: 10
  },
  galleryContainer: {
    // flex: 1,
    // marginVertical:40,
    marginTop:30,
    marginBottom:70,
    width: '100%',
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: 'wrap',
    // alignItems:"center"
  },
  gallerItem: {
    width: "45%",
    height:"40%"
  }
})
export default ChanelMedia