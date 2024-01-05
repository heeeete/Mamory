import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  Platform,
  Animated,
} from 'react-native';

import {theme} from '../colors';
import React, {useContext, useEffect, useState, useRef} from 'react';
import axios from 'axios';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AWS, {CodeStarNotifications} from 'aws-sdk';
import FastImage from 'react-native-fast-image';
import font from '../Styles/font';
import {ActivityIndicator} from 'react-native-paper';
import {papertheme} from '../Styles/react-native-paper-theme'; // theme.js에서 theme 가져오기
import {ThemeContext} from './Context/ThemeContext';
import Carousel, {
  Pagination,
  getInputRangeFromIndexes,
} from 'react-native-snap-carousel';
import {SafeAreaView} from 'react-native-safe-area-context';

const S3Config = require('../config/awsS3Config.json');
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const serverIP = '43.200.88.208';

const s3 = new AWS.S3({
  accessKeyId: S3Config.AccesskeyID,
  secretAccessKey: S3Config.Secretaccesskey,
  region: S3Config.region,
});

function DiaryCarousel({images, navigation, focusStatus, setFocusStatus}) {
  // const [idx, setIdx] = useState(0);

  // const initializeIndex = () => {
  //   setIdx(0); // 페이지 인덱스를 초기화합니다.
  // };

  useEffect(() => {
    // initializeIndex(); // 페이지 인덱스를 초기화합니다.
    setFocusStatus(0);
  }, [focusStatus]);

  const renderItem = ({item, index}) => (
    <View style={{...styles.image}}>
      <FastImage
        source={{uri: item}}
        style={{
          borderRadius: 10,
          width: '100%',
          height: '100%',
        }}
        resizeMode="cover"
      />
    </View>
  );

  return (
    <View
      style={{
        width: screenWidth,
        height: screenWidth * 0.8 - 60,
        paddingTop: 10,
        alignSelf: 'center',
      }}>
      <Carousel
        key={focusStatus}
        data={images}
        renderItem={renderItem}
        sliderWidth={screenWidth}
        itemWidth={screenWidth * 0.55}
        layout="stack"
        layoutCardOffset={9}
        // onSnapToItem={setIdx}
      />
    </View>
  );
}

export default function ViewDiary({navigation}) {
  const name = 'hyunjki2';
  const [diaries, setDiaries] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [keyword, setKeyword] = useState('');
  const [modifyButtons, setModifyButtons] = useState({});
  const [selectDiary, setSelectDiary] = useState(null);
  const [isEraseAlert, setIsEraseAlert] = useState(false);
  const {colorTheme} = useContext(ThemeContext);
  const {user} = useContext(ThemeContext);
  const [focusStatus, setFocusStatus] = useState(0);
  const [pressSearch, setPressSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef();
  const week = [
    '일요일',
    '월요일',
    '화요일',
    '수요일',
    '목요일',
    '금요일',
    '토요일',
  ];

  useEffect(() => {
    const refreshDiaries = navigation.addListener('focus', () => {
      //navigation.addListener를 사용하여 focus 이벤트를 수신
      //React Navigation에서 화면 간 이동이 발생할 때 해당 화면이 "focus"되는 것으로 간주
      //focus 이벤트는 해당 화면이 화면 스택에 포함될 때마다 발생하며, 페이지가 다시 보여질 때마다 호출
      // 수정된 데이터로 다이어리를 다시 불러오는 비동기 호출 또는 상태 업데이트 등
      // console.log('asd', user);
      handleScrollToTop();
      setFocusStatus(1);
      fetchDiaries();
      setKeyword('');
      setPressSearch(false); //너무 바뀌는게 보여
      setSearchKeyword('');
      // 초기에 모든 다이어리의 수정 버튼 상태를 false로 초기화
    });
    // refreshDiaries();
    return () => {
      refreshDiaries();
    };
  }, [navigation]);

  useEffect(() => {
    // 화면이 처음 렌더링될 때 초기화하는 코드
    const initialModifyButtons = {};
    diaries.forEach(diary => {
      initialModifyButtons[diary.idx] = false;
    });
    setModifyButtons(initialModifyButtons);
  }, [diaries]);

  const fetchDiaries = async () => {
    try {
      const response = await axios.get(`http://${serverIP}:3003/diaries`, {
        params: {
          user: user,
        },
      });
      const objectArray = response.data;
      const newArray = objectArray.map(obj => ({
        ...obj,
        modifyButton: false, // 예시로 age 값을 30으로 설정
      }));
      setDiaries(newArray);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleScrollToTop = () => {
    scrollRef.current?.scrollTo({y: 0, deprecatedAnimated: true});
  };

  const renderDiaries = () => {
    const filteredDiaries = diaries.filter(
      diary =>
        diary.text.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        diary.date.toLowerCase().includes(searchKeyword.toLowerCase()),
    );

    return filteredDiaries.map((diary, index) => {
      //console.log(diary.date);
      const date = new Date(diary.date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      const label = new Date(formattedDate).getDay();
      const images = diary.img !== null ? JSON.parse(diary.img) : [];

      const diarymood =
        diary.mood === 'smile'
          ? require('../image/smile_gif.gif')
          : diary.mood === 'sad'
          ? require('../image/sad_gif.gif')
          : diary.mood === 'neutral'
          ? require('../image/neutral_gif.gif')
          : diary.mood === 'angry'
          ? require('../image/angry_gif.gif')
          : null;
      const diaryweather =
        diary.weather === 'snow'
          ? require('../image/snow_gif.gif')
          : diary.weather === 'rain'
          ? require('../image/rain_gif.gif')
          : diary.weather === 'sunny'
          ? require('../image/sunny_gif.gif')
          : diary.weather === 'cloudy'
          ? require('../image/cloudy_gif.gif')
          : null;

      return (
        <View
          key={diary.idx}
          style={{
            ...styles.diarybox,
            // borderColor: colorTheme.hexCode2,
            borderColor: 'lightgrey',
          }}>
          <View
            style={{
              borderBottomWidth: 1,
              borderColor: 'lightgrey',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <View style={{flexDirection: 'row'}}>
              <Text
                style={{
                  marginRight: 6,
                  fontFamily: 'IMHyemin-Regular',
                }}>
                {formattedDate}
              </Text>
              <Text
                style={{
                  fontFamily: 'IMHyemin-Regular',
                  color:
                    label === 6 || label === 7
                      ? colorTheme.color === 'black'
                        ? 'red'
                        : colorTheme.hexCode
                      : 'black',
                }}>
                {week[label]}
              </Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <FastImage
                source={diarymood} // 이미지 파일의 상대 경로 사용
                style={{width: 40, height: 40}}
                resizeMode={FastImage.resizeMode.contain}
              />
              <FastImage
                source={diaryweather} // 이미지 파일의 상대 경로 사용
                style={{width: 40, height: 40}}
                resizeMode={FastImage.resizeMode.contain}
              />
            </View>
            {/* <Text>{diary.date}</Text> */}
          </View>
          {images.length !== 0 ? (
            <DiaryCarousel
              images={images}
              navigation={navigation}
              focusStatus={focusStatus}
              setFocusStatus={setFocusStatus}
            />
          ) : null}
          {diary.text.length !== 0 ? (
            <ScrollView
              style={{
                ...styles.scrollcontent,
                width: '100%',
                // backgroundColor: 'red',
              }}
              contentContainerStyle={{
                ...styles.content,
                marginTop: images.length === 0 ? 10 : 0, //너무 정신없낭
              }}>
              <Text style={{fontFamily: 'IMHyemin-Regular'}}>{diary.text}</Text>
            </ScrollView>
          ) : (
            <View style={{marginBottom: -5}}></View>
          )}
          <TouchableOpacity
            style={{
              // backgroundColor: 'red',
              width: 44,
              alignSelf: 'flex-end',
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              right: '-3%',
              // bottom: '1%',
            }}
            onPress={() => {
              navigation.navigate('ModifyDiary', {diary});
            }}>
            <AntDesign
              name="edit"
              size={22}
              color={'lightgrey'}
              // color={colorTheme.hexCode2}
              style={
                {
                  // alignSelf: 'flex-end',
                  // paddingHorizontal: 30,
                  // marginBottom: -10,
                  // opacity: 0.4,
                }
              }
            />
          </TouchableOpacity>
        </View>
      );
    });
  };

  let scrollOffsetY = useRef(new Animated.Value(0)).current;

  return (
    <SafeAreaView edges={['top']} style={{flex: 1, backgroundColor: 'white'}}>
      {pressSearch === false ? (
        <TouchableOpacity
          style={{
            width: 44,
            height: 44,
            justifyContent: 'center',
            marginRight: '6%',
            alignSelf: 'flex-end',
          }}
          onPress={() => {
            setPressSearch(true);
          }}>
          <FontAwesome
            name="search"
            size={21}
            color={colorTheme.hexCode2}
            style={{
              alignSelf: 'flex-end',
              opacity: 0.7,
            }}
          />
        </TouchableOpacity>
      ) : (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            style={{
              width: 44,
              height: 44,
              justifyContent: 'center',
            }}
            onPress={() => {
              setPressSearch(false);
              setSearchKeyword('');
              setKeyword('');
            }}>
            <Entypo
              name="chevron-left"
              size={22}
              // color={'lightgrey'}
              color={colorTheme.hexCode2}
              style={{
                marginLeft: '30%',
              }}
            />
          </TouchableOpacity>
          <TextInput
            placeholder="search"
            style={{
              ...styles.searchbar,
              borderColor: 'lightgrey',
              fontFamily: font.mainFont,
            }}
            value={keyword}
            onChangeText={keyword => setKeyword(keyword)}
            onSubmitEditing={() => setSearchKeyword(keyword)}
          />
        </View>
      )}
      <View
        style={{
          borderBottomWidth: 1,
          borderColor: 'lightgrey',
          width: '90%',
          alignSelf: 'center',
        }}></View>
      {diaries.length !== 0 ? (
        <View style={{flex: 1, backgroundColor: 'white'}}>
          <ScrollView
            ref={scrollRef}
            // horizontal={true}
            style={styles.body}
            scrollIndicatorInsets={{right: 1}}
            contentContainerStyle={styles.container}>
            <View
              style={{
                width: '100%',
                justifyContent: 'space-between',
              }}></View>
            {renderDiaries()}
          </ScrollView>
        </View>
      ) : isLoading ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
          }}>
          <ActivityIndicator
            animating={true}
            size={'large'}
            color={colorTheme.hexCode2}
          />
        </View>
      ) : (
        <View
          style={{flex: 1, backgroundColor: 'white', justifyContent: 'center'}}>
          <Text
            style={{
              fontFamily: font.mainFont,
              alignSelf: 'center',
              color: 'grey',
            }}>
            다이어리를 추가해보세요!
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    // padding: '10%',
    paddingTop: 0,
    alignItems: 'center',
  },
  body: {
    // backgroundColor: theme.point,
  },
  diarybox: {
    flex: 1,
    borderRadius: 8,
    // backgroundColor: 'lightblue',
    //flexDirection: "row",
    borderWidth: 1,
    // borderColor: colorTheme.hexCode2,
    //borderBottomWidth: 1,
    // borderTopColor: 'pink',
    // borderBlockColor: 'pink',
    //  borderColor: 'pink',
    width: screenWidth * 0.9,
    //height: screenWidth * 0.7,
    padding: 20,
    paddingBottom: 0,
    // marginBottom: 15,
    marginTop: 10,
    //paddingBottom: 0,
  },
  image: {
    //alignSelf: 'center',
    marginTop: 15,
    marginBottom: 5,
    width: screenWidth * 0.55,
    height: screenWidth * 0.7 - 60,
  },
  scrollcontent: {
    flex: 1,
    marginTop: 3,
    // padding: 10,
    // paddingBottom: 100,
    // width: screenWidth * 0.41 - 15, //왜 바꿔도 안바뀌지?
    maxHeight: screenWidth * 0.5 - 33,
  },
  content: {
    //padding: 4,
    paddingLeft: '2%',
    // paddingRight: 3,
    paddingBottom: 15, //끝에까지 보이려면 필요한데 너무 못생겼어
    //height: screenWidth * 0.6 - 33,
    //  width: screenWidth * 0.3,
  },
  searchbar: {
    // marginTop: '2%',
    borderWidth: 1,
    // borderColor: 'lightgrey',
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginHorizontal: 23,
    width: screenWidth * 0.4,
    borderRadius: 5,
    backgroundColor: 'white',
    // marginBottom: '2%',
  },
  title: {
    paddingLeft: '10%',
    alignSelf: 'center',
    // marginLeft: '-5%',
    fontFamily: 'IMHyemin-Regular',
  },
  modifybutton: {color: theme.base, fontFamily: 'IMHyemin-Regular'},
});
