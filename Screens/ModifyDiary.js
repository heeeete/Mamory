import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Pressable,
  Keyboard,
  NativeModules,
  Alert,
  ImageBackground,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {theme} from '../colors';
import axios from 'axios';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
const {StatusBarManager} = NativeModules;
import React, {useContext, useEffect, useState} from 'react';
// import Fontisto from 'react-native-vector-icons/Fontisto';
import AWS, {CodeStarNotifications} from 'aws-sdk';
import RNFS from 'react-native-fs';
import {Buffer} from 'buffer';
import Swiper from 'react-native-swiper';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import font from '../Styles/font';
import FastImage from 'react-native-fast-image';
import Carousel, {getInputRangeFromIndexes} from 'react-native-snap-carousel';
import {SafeAreaView} from 'react-native-safe-area-context';
import CustomAlert from './component/CustomAlert';
import {stringify} from 'querystring';
import {ThemeContext} from './Context/ThemeContext';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const S3Config = require('../config/awsS3Config.json');
const s3 = new AWS.S3({
  accessKeyId: S3Config.AccesskeyID,
  secretAccessKey: S3Config.Secretaccesskey,
  region: S3Config.region,
});
const serverIP = '43.200.88.208';

function DiaryCarousel({imgConfig, setImgConfig}) {
  const [idx, setIdx] = useState(0);

  const deleteImageFromS3 = imageUrl => {
    const key = imageUrl.split('/').pop(); // 이미지 URL에서 키 추출

    const params = {
      Bucket: S3Config.bucket,
      Key: key, // 이미지 키
    };

    // 이미지 삭제 요청 보내기
    s3.deleteObject(params, (err, data) => {
      if (err) {
        console.log('이미지 삭제 실패:', err);
      } else {
        console.log('이미지 삭제 성공:', data);
      }
    });
  };
  const eraseImage = indexToRemove => {
    if (typeof imgConfig[0] === 'string')
      deleteImageFromS3(imgConfig[indexToRemove]);
    // imgConfig 배열에서 해당 인덱스의 이미지 정보를 제거
    const updatedImgConfig = imgConfig.filter(
      (_, index) => index !== indexToRemove,
    );
    setImgConfig(updatedImgConfig); // 업데이트된 배열로 imgConfig 업데이트
  };

  const renderItem = ({item, index}) => (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <FastImage
        source={{uri: typeof item === 'string' ? item : item.uri}}
        style={{
          borderRadius: 10,
          width: screenHeight * 0.3,
          height: screenHeight * 0.3,
        }}
        resizeMode="cover"
      />
      <TouchableOpacity
        onPress={() => eraseImage(index)}
        style={{position: 'absolute', top: 6, right: 25}}>
        <FontAwesome name="trash-o" size={24} color="white" opacity={0.6} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View
      style={{
        height: screenHeight * 0.4,
        // flex: 4,
        // marginTop: '10%',
        alignSelf: 'center',
        // justifyContent: 'center',
      }}>
      <Carousel
        data={imgConfig}
        renderItem={renderItem}
        sliderWidth={screenWidth}
        itemWidth={screenWidth * 0.7}
        layout="stack"
        layoutCardOffset={9}
        contentContainerCustomStyle={{
          alignItems: 'center',
        }}
        onSnapToItem={setIdx}
      />
    </View>
  );
}

export default function ModifyDiary({navigation, route}) {
  const {diary} = route.params;
  const [text, setText] = useState(diary.text);
  const [mood, setMood] = useState(diary.mood);
  const [weather, setWeather] = useState(diary.weather);
  const images = diary.img !== null ? JSON.parse(diary.img) : [];
  const [imgConfig, setImgConfig] = useState(images);
  const [clearAlert, setClearAlert] = useState(false);
  const [isEraseAlert, setIsEraseAlert] = useState(false);
  const {user} = useContext(ThemeContext);

  useEffect(() => {
    Platform.OS == 'ios'
      ? StatusBarManager.getHeight(statusBarFrameData => {
          setStatusBarHeight(statusBarFrameData.height);
        })
      : null;
  }, []);

  const handleMoodPress = iconName => {
    setMood(iconName);
  };
  const handleWeatherPress = iconName => {
    setWeather(iconName);
  };

  const year = new Date(diary.date).getFullYear();
  const month = new Date(diary.date).getMonth() + 1;
  const day = new Date(diary.date).getDate();
  const [statusBarHeight, setStatusBarHeight] = useState(0);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const deleteImageFromS3 = imageUrl => {
    const key = imageUrl.split('/').pop(); // 이미지 URL에서 키 추출

    const params = {
      Bucket: S3Config.bucket,
      Key: key, // 이미지 키
    };

    // 이미지 삭제 요청 보내기
    s3.deleteObject(params, (err, data) => {
      if (err) {
        console.log('이미지 삭제 실패:', err);
      } else {
        console.log('이미지 삭제 성공:', data);
      }
    });
  };

  const eraseDiary = async (idx, images) => {
    try {
      const response = await axios.delete(`http://${serverIP}:3003/erase`, {
        data: {
          idx: idx,
        },
      });
      if (images.length !== 0 && typeof images[0] === 'string') {
        images.map(image => {
          deleteImageFromS3(image);
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  /////이미지 추가
  const selectImage = async () => {
    const options = {
      title: '사진 선택',
      selectionLimit: 3,
      quality: 0.3,
    };

    launchImageLibrary(options, async response => {
      if (response.didCancel) {
        console.log('사용자가 이미지 선택을 취소했습니다.');
      } else if (response.error) {
        console.log('ImagePicker 에러: ', response.error);
      } else if (response.customButton) {
        console.log('Custom button clicked :', response.customButton);
      } else {
        setImgConfig(response.assets);
        // console.log(response.assets);
      }
    });
  };

  const uploadImageToS3 = async index => {
    return new Promise(async (resolve, reject) => {
      const fileData = await RNFS.readFile(index.uri, 'base64');
      const params = {
        Bucket: S3Config.bucket,
        Key: index.fileName,
        Body: Buffer.from(fileData, 'base64'),
        ACL: 'public-read',
        ContentType: index.type,
      };

      // 버킷에 파일 업로드
      s3.upload(params, function (err, data) {
        if (err) {
          console.log(`이미지 업로드 에러`, err);
          reject(err);
        } else {
          console.log(`이미지 업로드 성공. ${data.Location}`);
          resolve(data.Location);
        }
      });
    });
  };

  const modify = async () => {
    if (mood === '') return Alert.alert('', '기분을 선택해주세요');
    if (weather === '') return Alert.alert('', '날씨를 선택해주세요');

    try {
      let jsonImages;
      if (typeof imgConfig[0] === 'object') {
        const uploadPromises =
          imgConfig.length !== 0
            ? imgConfig.map(image => uploadImageToS3(image))
            : null;
        // 모든 프로미스가 완료될 때까지 기다림
        const uploadedImageUrls = uploadPromises
          ? await Promise.all(uploadPromises)
          : null;
        // console.log(uploadedImageUrls);
        // Promise.all 함수는 여러 개의 프로미스를 동시에 실행
        // 모든 프로미스가 완료되었을 때 해당 프로미스들의 결과를 배열로 반환
        // 반환된 URL들이 uploadedImageUrls 배열에 저장
        jsonImages = uploadedImageUrls
          ? JSON.stringify(uploadedImageUrls)
          : null;
      } else jsonImages = JSON.stringify(imgConfig);
      const response = await axios.put(`http://${serverIP}:3003/modify`, {
        user: user,
        mood: mood,
        weather: weather,
        text: text,
        idx: diary.idx,
        img: jsonImages,
      });

      setClearAlert(true);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={{flex: 1, backgroundColor: 'white'}}>
      <KeyboardAvoidingView
        style={{flex: 1, paddingHorizontal: '5%'}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View
          style={{
            height: 'auto',
          }}>
          <View
            style={{
              height: 'auto',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: '5%',
            }}>
            <Text style={{fontFamily: font.boldFont, fontSize: 13}}>
              {year}년 {month}월 {day}일
            </Text>
          </View>
          <View
            style={{
              height: 50,
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                right: '2%',
              }}>
              <TouchableOpacity
                style={{
                  width: 44,
                  height: 44,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => handleMoodPress('smile')}>
                {mood != 'smile' ? (
                  <FastImage
                    source={require('../image/smile.png')} // 이미지 파일의 상대 경로 사용
                    style={{width: 36, height: 36}}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                ) : (
                  <FastImage
                    source={require('../image/smile_gif.gif')} // 이미지 파일의 상대 경로 사용
                    style={{width: 42, height: 42}}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: 44,
                  height: 44,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => handleMoodPress('sad')}>
                {mood != 'sad' ? (
                  <FastImage
                    source={require('../image/sad.png')} // 이미지 파일의 상대 경로 사용
                    style={{width: 36, height: 36}}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                ) : (
                  <FastImage
                    source={require('../image/sad_gif.gif')} // 이미지 파일의 상대 경로 사용
                    style={{width: 42, height: 42}}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: 44,
                  height: 44,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => handleMoodPress('angry')}>
                {mood != 'angry' ? (
                  <FastImage
                    source={require('../image/angry.png')} // 이미지 파일의 상대 경로 사용
                    style={{width: 33, height: 33}}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                ) : (
                  <FastImage
                    source={require('../image/angry_gif.gif')} // 이미지 파일의 상대 경로 사용
                    style={{width: 42, height: 42}}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: 44,
                  height: 44,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => handleMoodPress('neutral')}>
                {mood != 'neutral' ? (
                  <FastImage
                    source={require('../image/neutral.png')} // 이미지 파일의 상대 경로 사용
                    style={{width: 33, height: 33}}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                ) : (
                  <FastImage
                    source={require('../image/neutral_gif.gif')} // 이미지 파일의 상대 경로 사용
                    style={{width: 42, height: 42}}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                )}
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                left: '2%',
                // justifyContent: 'center',
                // position: 'relative',
                // right: '-1%',
              }}>
              <TouchableOpacity
                style={{
                  width: 44,
                  height: 44,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => handleWeatherPress('sunny')}>
                {weather != 'sunny' ? (
                  <FastImage
                    source={require('../image/sunny.png')} // 이미지 파일의 상대 경로 사용
                    style={{width: 33, height: 33}}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                ) : (
                  <FastImage
                    source={require('../image/sunny_gif.gif')} // 이미지 파일의 상대 경로 사용
                    style={{width: 43, height: 43}}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: 44,
                  height: 44,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => handleWeatherPress('cloudy')}>
                {weather != 'cloudy' ? (
                  <FastImage
                    source={require('../image/cloudy.png')} // 이미지 파일의 상대 경로 사용
                    style={{width: 36, height: 36}}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                ) : (
                  <FastImage
                    source={require('../image/cloudy_gif.gif')} // 이미지 파일의 상대 경로 사용
                    style={{width: 47, height: 47}}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: 44,
                  height: 44,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => handleWeatherPress('rain')}>
                {weather != 'rain' ? (
                  <FastImage
                    source={require('../image/rain.png')} // 이미지 파일의 상대 경로 사용
                    style={{width: 36, height: 36}}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                ) : (
                  <FastImage
                    source={require('../image/rain_gif.gif')} // 이미지 파일의 상대 경로 사용
                    style={{width: 47, height: 47}}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: 44,
                  height: 44,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => handleWeatherPress('snow')}>
                {weather != 'snow' ? (
                  <FastImage
                    source={require('../image/snow.png')} // 이미지 파일의 상대 경로 사용
                    style={{width: 36, height: 36}}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                ) : (
                  <FastImage
                    source={require('../image/snow_gif.gif')} // 이미지 파일의 상대 경로 사용
                    style={{width: 47, height: 47}}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {imgConfig.length !== 0 ? (
          <DiaryCarousel imgConfig={imgConfig} setImgConfig={setImgConfig} />
        ) : (
          <Pressable
            style={{
              height: screenHeight * 0.4,
              paddingVertical: '5%',
              // marginHorizontal: '20%',
              justifyContent: 'center',
              // backgroundColor: 'red',
            }}
            onPress={() => Keyboard.dismiss()}>
            <TouchableOpacity
              style={{height: '50%', marginHorizontal: '10%'}}
              onPress={() => selectImage()}>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  opacity: 0.4,
                  // backgroundColor: 'red',
                }}>
                <Text
                  style={{
                    fontFamily: font.mainFont,
                    marginBottom: '5%',
                    textAlign: 'center',
                  }}>
                  추억이 담긴 사진을 업로드 해보세요!
                </Text>
              </View>
            </TouchableOpacity>
          </Pressable>
        )}
        <View
          style={{
            // flex: 6,
            height: '37%',
            justifyContent: 'center',
            marginBottom: '10%',
          }}>
          <Pressable onPress={() => Keyboard.dismiss()}>
            <ImageBackground
              source={require('../image/2.png')}
              style={{
                width: '100%',
                height: '100%',
                //height: 250,
                opacity: 0.6,
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                borderRadius: 10,
              }}
              resizeMode="cover">
              <TextInput
                style={{
                  textAlignVertical: 'top',
                  // ...styles.input,
                  height: '100%',
                  //flex: 2,
                  width: '100%',
                  padding: '4%',
                  borderRadius: 10,
                  fontFamily: font.mainFont,
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                }}
                multiline={true}
                numberOfLines={15}
                value={text}
                onChangeText={setText}
                placeholder="오늘 하루를 기록해보세요"
              />
            </ImageBackground>
          </Pressable>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginBottom: '2%',
          }}>
          <TouchableOpacity
            style={{
              width: 44,
              alignItems: 'center',
              height: 44,
              // justifyContent: 'center',
            }}
            onPress={() => {
              setIsEraseAlert(true);
            }}>
            <Text
              style={{
                fontSize: 13,
                color: 'red',
                fontFamily: font.boldFont,
              }}>
              삭제
            </Text>
          </TouchableOpacity>
          <CustomAlert
            visible={isEraseAlert}
            title={'삭제 하시겠습니까?'}
            message={''}
            onClose={() => {
              setIsEraseAlert(false);
            }}
            onCloseButtonText={'취소'}
            onConfirmButtonText={'확인'}
            onConfirm={() => {
              eraseDiary(diary.idx, imgConfig);
              navigation.navigate('ViewDiary');
            }}
          />
          <TouchableOpacity
            style={{
              width: 44,
              alignItems: 'center',
              height: 44,
              // justifyContent: 'center',
            }}
            onPress={() => modify()}>
            <Text
              style={{
                fontSize: 13,
                // color: 'red',
                fontFamily: font.boldFont,
              }}>
              수정
            </Text>
          </TouchableOpacity>
          <CustomAlert
            visible={clearAlert}
            title={'수정 완료'}
            message={''}
            onClose={() => {
              setClearAlert(false);
              navigation.navigate('ViewDiary');
            }}
            onCloseButtonText={'확인'}
          />
        </View>
      </KeyboardAvoidingView>
      {/* </View> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    //borderWidth: 1,
    //borderRadius: 5,
    //borderColor: "pink",
    //padding: 10,
    minHeight: 100,
    // color: "white",
  },
});
