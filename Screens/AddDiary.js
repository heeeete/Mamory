import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  NativeModules,
  ImageBackground,
  Dimensions,
  Pressable,
} from 'react-native';
import axios from 'axios';
const {StatusBarManager} = NativeModules;
import React, {useContext, useEffect, useRef, useState} from 'react';
// import Fontisto from 'react-native-vector-icons/Fontisto';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AWS, {CodeStarNotifications} from 'aws-sdk';
import RNFS from 'react-native-fs';
import {Buffer} from 'buffer';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import FastImage from 'react-native-fast-image';
import font from '../Styles/font';
import Carousel, {getInputRangeFromIndexes} from 'react-native-snap-carousel';
import {SafeAreaView} from 'react-native-safe-area-context';
import VibrationComponent from './component/VibrationComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from './component/CustomAlert';
import {ThemeContext} from './Context/ThemeContext';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const S3Config = require('../config/awsS3Config.json');
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const s3 = new AWS.S3({
  accessKeyId: S3Config.AccesskeyID,
  secretAccessKey: S3Config.Secretaccesskey,
  region: S3Config.region,
});
const serverIP = '43.200.88.208';

function DiaryCarousel({imgConfig, setImgConfig, colorTheme}) {
  const [idx, setIdx] = useState(0);

  const eraseImage = indexToRemove => {
    // imgConfig 배열에서 해당 인덱스의 이미지 정보를 제거
    const updatedImgConfig = imgConfig.filter(
      (_, index) => index !== indexToRemove,
    );
    setImgConfig(updatedImgConfig); // 업데이트된 배열로 imgConfig 업데이트
  };
  const renderItem = ({item, index}) => (
    <View
      style={{
        // backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <FastImage
        source={{uri: item.uri}}
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
        // backgroundColor: 'pink',
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
export default function AddDiary({navigation, route}) {
  const [text, setText] = useState('');
  const [mood, setMood] = useState('');
  const [weather, setWeather] = useState('');
  const {user} = useContext(ThemeContext);
  const [imgConfig, setImgConfig] = useState([]);
  const [clearAlert, setClearAlert] = useState(false);
  const {colorTheme} = useContext(ThemeContext);
  const moodRef = useRef(null);
  const weatherRef = useRef(null);
  // const [user, setUser] = useState(null);

  useEffect(() => {
    Platform.OS == 'ios'
      ? StatusBarManager.getHeight(statusBarFrameData => {
          setStatusBarHeight(statusBarFrameData.height);
        })
      : null;
  }, []);

  const triggerVibration = () => {
    if (mood === '') moodRef.current.startVibration();
    if (weather === '') weatherRef.current.startVibration();
  };

  const handleMoodPress = iconName => {
    setMood(iconName);
  };
  const handleWeatherPress = iconName => {
    setWeather(iconName);
  };

  const {year, month, day} = route.params.date;
  const [statusBarHeight, setStatusBarHeight] = useState(0);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  /////////////////////////////////////////
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

  //////////////////////////////////////////////////
  const register = async () => {
    if (mood === '' || weather === '') return triggerVibration();

    try {
      const uploadPromises =
        imgConfig.length !== 0
          ? imgConfig.map(image => uploadImageToS3(image))
          : null;
      // 모든 프로미스가 완료될 때까지 기다림
      const uploadedImageUrls = uploadPromises
        ? await Promise.all(uploadPromises)
        : null;
      // (uploadedImageUrls);
      // Promise.all 함수는 여러 개의 프로미스를 동시에 실행
      // 모든 프로미스가 완료되었을 때 해당 프로미스들의 결과를 배열로 반환
      // 반환된 URL들이 uploadedImageUrls 배열에 저장
      const jsonImages = uploadedImageUrls
        ? JSON.stringify(uploadedImageUrls)
        : null;
      const response = await axios.post(`http://${serverIP}:3003/diary`, {
        user: user,
        mood: mood,
        weather: weather,
        text: text,
        date: route.params.date.dateString,
        img: jsonImages,
      });
      setClearAlert(true);
    } catch (error) {
      error;
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
              // alignItems: 'center',
              justifyContent: 'center',
            }}>
            <VibrationComponent
              ref={moodRef}
              style={{
                // margin: 0,
                // position: 'relative',
                // left: '-4%',
                right: '2%',
                // alignSelf: 'flex-start',
                alignItems: 'center',
                flexDirection: 'row',
                // backgroundColor: 'red',
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
            </VibrationComponent>
            <VibrationComponent
              ref={weatherRef}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                left: '2%',
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
            </VibrationComponent>
          </View>
        </View>
        {imgConfig.length !== 0 ? (
          <DiaryCarousel
            imgConfig={imgConfig}
            setImgConfig={setImgConfig}
            colorTheme={colorTheme}
          />
        ) : (
          <Pressable
            style={{
              height: screenHeight * 0.4,
              paddingVertical: '5%',
              justifyContent: 'center',
            }}
            onPress={() => Keyboard.dismiss()}>
            <TouchableOpacity
              style={{
                height: '50%',
                marginHorizontal: '10%',
              }}
              onPress={() => selectImage()}>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  opacity: 0.4,
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
                  height: '100%',
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
            marginBottom: '2%',
            flexDirection: 'row',
            justifyContent: 'space-around',
          }}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Main');
            }}
            style={{
              width: 44,
              alignItems: 'center',
              height: 44,
            }}>
            <Text
              style={{
                fontSize: 13,
                color: 'red',
                fontFamily: font.boldFont,
              }}>
              취소
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => register()}
            style={{
              width: 44,
              alignItems: 'center',
              height: 44,
            }}>
            <Text
              style={{
                fontSize: 13,
                fontFamily: font.boldFont,
              }}>
              등록
            </Text>
          </TouchableOpacity>
          <CustomAlert
            visible={clearAlert}
            title={'등록 완료'}
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
    // padding: 16,
  },
  input: {
    minHeight: 100,
  },
});
