//로그아웃
//탈퇴
//회원 정보 변경
//다이어리 기입 일 수에 따라 다른 이미지
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Image,
  TextInput,
  Platform,
} from 'react-native';
import {ThemeContext} from './Context/ThemeContext';
import {useEffect, useState, useContext} from 'react';
import Modal2 from 'react-native-modal';
//------------------icon-----------------------
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Entypo from 'react-native-vector-icons/Entypo';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
//------------------icon-----------------------
import {ActivityIndicator} from 'react-native-paper';
import axios from 'axios';
import font from '../Styles/font';
import AddModal from './Bookaddmodal';
import {useNavigation} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from './component/CustomAlert';
import DatePicker from 'react-native-date-picker';
const S3Config = require('../config/awsS3Config.json');
const s3 = new AWS.S3({
  accessKeyId: S3Config.AccesskeyID,
  secretAccessKey: S3Config.Secretaccesskey,
  region: S3Config.region,
});
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const serverIP = '43.200.88.208';

// function UserInfoModal(userInfoModalStatus, setUserInfoModalStatus) {
//   const {nick, birth} = useContext(ThemeContext);
//   return (
//     <Modal2 isVisible={userInfoModalStatus} style={{alignItems: 'center'}}>
//       <View
//         style={{
//           width: '70%',
//           flex: 0.2,
//           backgroundColor: 'pink',
//           borderRadius: 15,
//         }}>
//         <TouchableOpacity onPress={() => setUserInfoModalStatus(false)}>
//           <Text>hehe</Text>
//         </TouchableOpacity>
//       </View>
//     </Modal2>
//   );
// }
function DatePick({setTempBirth, tempBirth, setOpenPicker, openPicker}) {
  const [selectedDate, setSelectedDate] = useState(new Date(tempBirth));

  return (
    <DatePicker
      modal
      open={openPicker}
      mode="date"
      date={selectedDate}
      onConfirm={birthday => {
        setOpenPicker(false);
        setSelectedDate(birthday);
        const year = birthday.getFullYear();
        const month = String(birthday.getMonth() + 1).padStart(2, '0');
        const day = String(birthday.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        setTempBirth(formattedDate);
      }}
      onCancel={() => {
        setOpenPicker(false);
      }}
    />
  );
}

function ColorThemeModal({colorThemeModalStatus, setColorThemeModalStatus}) {
  const {colorTheme, setColorTheme} = useContext(ThemeContext);
  const [isLodaing, setIsLoading] = useState(false);

  const setThemeColor = async (color, hexCode, hexCode2) => {
    setIsLoading(true);

    //hexCode : Main Color, ViewDiart 수정, 삭제 Text
    //hexCode2 : Todo Star Icon, Switch Color, ViewDiary 수정 Button
    await AsyncStorage.setItem(
      'color',
      JSON.stringify({
        color: color,
        hexCode: hexCode,
        hexCode2: hexCode2,
      }),
    );
    //setColorTheme 변경시 ThemeProvider 의 useState Hook 상태 변경으로 rerender
    setColorTheme({
      color: color,
      hexCode: hexCode,
      hexCode2: hexCode2,
    });
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Modal2
      isVisible={colorThemeModalStatus}
      style={{alignItems: 'center'}}
      onBackdropPress={() => setColorThemeModalStatus(false)}>
      <View
        style={{
          width: '70%',
          flex: 0.2,
          backgroundColor: 'white',
          borderRadius: 15,
        }}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{fontFamily: font.boldFont, color: colorTheme.hexCode}}>
            {isLodaing ? '열심히 변경중' : '색상을 선택해 주세요'}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
          }}>
          {isLodaing ? (
            <ActivityIndicator
              animating={true}
              size={30}
              color={colorTheme.hexCode}
            />
          ) : (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1,
              }}>
              <TouchableOpacity
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 50,
                  backgroundColor: '#191919',
                  marginRight: 5,
                }}
                onPress={() =>
                  setThemeColor('black', '#191919', '#5b5b5b')
                }></TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 50,
                  backgroundColor: '#93c47d',
                  marginRight: 5,
                }}
                onPress={() =>
                  setThemeColor('green', '#93c47d', '#d9ead3')
                }></TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 50,
                  backgroundColor: '#fccccc',
                  marginRight: 5,
                }}
                onPress={() =>
                  setThemeColor('pink', '#fccccc', '#fce8e8')
                }></TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 50,
                  backgroundColor: '#adc2eb',
                  marginRight: 5,
                }}
                onPress={() =>
                  setThemeColor('lightblue', '#adc2eb', '#d6e0f5')
                }></TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 50,
                  backgroundColor: '#f6b26b',
                  marginRight: 5,
                }}
                onPress={() =>
                  setThemeColor('orange', '#f6b26b', '#ffe6b7')
                }></TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 50,
                  backgroundColor: '#b4a7d6',
                  marginRight: 5,
                }}
                onPress={() =>
                  setThemeColor('purple', '#b4a7d6', '#e1dbee')
                }></TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal2>
  );
}

function getMoodMent(mood) {
  const happyMessages = [
    '오늘 하루도 행복만 가득하길 바라요!',
    '기분이 좋다니, 저도 기쁘네요!',
    '앞으로의 기록들도 기쁨으로 물들길!',
    '행복한 순간을 놓치지 마세요!',
    '더 많은 기쁨이 계속해서 당신을 찾아갈거에요!',
    '오늘도 행복이 가득한 하루 되세요!',
    '기분이 좋아 보여서 저도 기분이 좋아지네요!',
    '당신의 하루가 끝없는 행복으로 가득 차길 바라요!',
    '지금처럼 행복한 순간이 더 많아졌으면 좋겠어요',
    '오늘도 웃음으로 하루를 시작해 보세요!',
  ];

  const angryMessages = [
    '짜증날 때도 있지만, 괜찮아요. 이 감정 또한 지나갈거에요',
    '지금의 기분은 새로운 기회를 만들 수 있는 출발점일거에요 더 나은 날들이 기다리고 있어요!',
    '솔직하게 감정을 표현하는건 강함을 보여줍니다. 당신은 강하고 자발적인 사람이에요!',
    '감정의 파도가 가라앉으면, 당신은 더 큰 내일을 만날 거예요',
    '이럴 때일수록 마음의 평화를 찾아보세요.',
    '당신의 내일은 밝아요. 지금의 감정은 향후의 행복을 위한 준비일거에요. ',
    '때로는 화날 때가 힘들지만, 그것은 더 나은 날들을 위한 과정 중 하나일 뿐이에요.',
    '감정은 파도처럼 오고 가기 마련이에요. 화나는 감정도 그렇게 지나갈 거예요.',
    '어려운 일이 있으면 언제든 저에게 털어놔 보세요 저는 언제나 당신을 응원해요!',
    '화가 나도 괜찮아요, 모든 감정은 중요하니까요.',
  ];

  const sadMessages = [
    '눈물이 나도 괜찮아요, 감정을 표현하는 건 자연스러워요',
    '혼자가 아니에요, 제가 당신을 응원하고 있어요',
    '마음이 아프다면, 잠시 쉬어도 괜찮아요',
    '힘든 일은 저에게 털어내세요 저는 항상 당신을 응원해요',
    '지금 이 순간이 어렵더라도 더 나은 미래가 올 거에요',
    '누구나 힘든 시기가 있어요. 지금은 그런 시간일 뿐이에요',
    '잠시 슬프더라도, 또 다른 기쁨이 올 거에요',
    '슬픔은 머무르지 않아요. 당신은 이를 이겨내고 행복을 찾을 수 있어요.',
    '저도 당신의 슬픔을 함께 느껴요',
    '기록하는건 슬픔의 바다에 떠 있을 때, 새로운 희망의 섬을 찾는데 도움이 될 거예요.',
  ];

  const neutralMessages = [
    '그저 그런 날도 괜찮아요, 모든 날이 특별할 순 없으니까요',
    '무료한 날이면 새로운 것을 시작해 보는 건 어떨까요?',
    '오늘은 그저 그럴지 모르지만, 내일은 더 나은 하루가 될 수 있어요',
    '기분이 그저 그럴 땐, 좋아하는 음악을 들어보세요.',
    '어떤 날은 평범하게 보이더라도, 그 안에는 아름다움이 숨겨져 있을거에요.',
    '하루의 끝은 하루의 시작이기도 해요. 내일은 더 나은 날이 될 거예요.',
    '평범함 속에서도 작은 행복을 찾아보세요',
    '조금 지루하더라도, 이것도 하나의 추억이 될 거에요',
    '그저 그럴 땐, 좋은 책을 읽어보는 건 어떨까요?',
    '그저 그런 하루도, 당신이 있어서 의미가 있어요',
  ];

  if (mood === 'smile')
    return happyMessages[Math.floor(Math.random() * (9 - 0) + 1)];
  else if (mood === 'sad')
    return sadMessages[Math.floor(Math.random() * (9 - 0) + 1)];
  else if (mood === 'neutral')
    return neutralMessages[Math.floor(Math.random() * (9 - 0) + 1)];
  else if (mood === 'angry')
    return angryMessages[Math.floor(Math.random() * (9 - 0) + 1)];
}

function RenderMoodMent({ment}) {
  const {colorTheme} = useContext(ThemeContext);

  return (
    <Text
      style={{
        ...styles.text,
        color: colorTheme.color === 'black' ? 'white' : 'grey',
      }}>
      {ment}
    </Text>
  );
}

function MyPage({navigation}) {
  const [colorThemeModalStatus, setColorThemeModalStatus] = useState(false);
  const [userInfoModalStatus, setUserInfoModalStatus] = useState(false);
  const [moodArray, setMoodArray] = useState([]);
  const [totalDay, setTotalDay] = useState();
  const {user, setUser} = useContext(ThemeContext);
  const {nick, setNick} = useContext(ThemeContext);
  // const {id} = useContext(ThemeContext);
  const {birth, setBirth} = useContext(ThemeContext);
  const [tempNick, setTempNick] = useState(nick);
  const [tempBirth, setTempBirth] = useState(birth);
  const [openAlert, setOpenAlert] = useState(false);
  const [openPicker, setOpenPicker] = useState(false);
  const [clearAlert, setClearAlert] = useState(false);
  // const [modifyAlert, setModifyAlert] = useState(false);
  const {colorTheme, setColorTheme} = useContext(ThemeContext);
  const [ment, setMent] = useState(null);

  useEffect(() => {
    const refreshmood = navigation.addListener('focus', () => {
      //navigation.addListener를 사용하여 focus 이벤트를 수신
      //React Navigation에서 화면 간 이동이 발생할 때 해당 화면이 "focus"되는 것으로 간주
      //focus 이벤트는 해당 화면이 화면 스택에 포함될 때마다 발생하며, 페이지가 다시 보여질 때마다 호출
      // 수정된 데이터로 다이어리를 다시 불러오는 비동기 호출 또는 상태 업데이트 등
      fetchMood();
      // if (mood) checkMainMood();
    });
    return () => {
      refreshmood();
    };
  }, [navigation]);

  useEffect(() => {
    if (moodArray.length) {
      setMent(getMoodMent(moodArray[0][0]));
    }
  }, [moodArray]);

  // let totalItems;
  const checkMainMood = data => {
    let totalItems;
    const moodCounts = {};
    totalItems = data.length;
    data.forEach(item => {
      const mood = item.mood;
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });

    for (let mood in moodCounts) {
      moodCounts[mood] = ((moodCounts[mood] / totalItems) * 100).toFixed(1);
    }
    let tempArray;
    tempArray = Object.entries(moodCounts);

    // 퍼센트에 따라 내림차순으로 정렬
    tempArray.sort((a, b) => b[1] - a[1]);
    setTotalDay(totalItems);
    setMoodArray(tempArray);
  };

  const fetchMood = async () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0'); // 월을 2자리 숫자로 변환합니다.
    const ym = `${currentYear}-${currentMonth}`;
    try {
      const response = await axios.get(`http://${serverIP}:3003/getMood`, {
        params: {
          user: user,
          ym: ym,
        },
      });
      if (response.data) checkMainMood(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteImageFromS3 = imageUrl => {
    if (imageUrl.includes('amazonaws')) {
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
    }
  };

  const deleteImages = async () => {
    try {
      const response1 = await axios.get(
        `http://${serverIP}:3003/rememberBookImages`,
        {
          params: {
            user: user,
          },
        },
      );
      const response2 = await axios.get(`http://${serverIP}:3003/diaryImages`, {
        params: {
          user: user,
        },
      });
      {
        response1.data.length !== 0
          ? response1.data.map(item => {
              // console.log(item.img_url);
              if (item.img_url !== null) deleteImageFromS3(item.img_url);
            })
          : console.log('리멤버북에 사진 없음');
      }
      {
        response2.data.length !== 0
          ? response2.data.map(item => {
              const images = JSON.parse(item.img);
              images.map(img => {
                // console.log(img);
                if (img !== null) deleteImageFromS3(img);
              });
            })
          : console.log('다이어리에 사진 없음');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deleteMemories = async () => {
    try {
      const response1 = await axios.delete(
        `http://${serverIP}:3003/deleteDiaries`,
        {
          params: {
            user: user,
          },
        },
      );
      const response2 = await axios.delete(
        `http://${serverIP}:3003/deleteRememberBooks`,
        {
          params: {
            user: user,
          },
        },
      );
    } catch (error) {
      console.log(error);
    }
  };

  const deleteAccount = async () => {
    try {
      const response = await axios.delete(
        `http://${serverIP}:3003/deleteAccount`,
        {
          params: {
            user: user,
          },
        },
      );
    } catch (error) {
      console.log(error);
    }
  };

  const modifyInfo = async () => {
    //setNick, setBirth 바꾸기
    setNick(tempNick);
    setBirth(tempBirth);
    //asyncstorage값 바꾸기
    AsyncStorage.setItem(
      'userData',
      JSON.stringify({
        nickname: tempNick,
        birthday: tempBirth,
        id: user,
      }),
    );
    try {
      const response = await axios.put(`http://${serverIP}:3003/modifyUser`, {
        user: user,
        nickName: tempNick,
        birthday: tempBirth,
      });
      // setModifyAlert(true);
    } catch (error) {
      console.log(error);
    }
    //서버에 값 바꾸기
  };

  return (
    <SafeAreaView edges={['top']} style={{flex: 1, backgroundColor: 'white'}}>
      {moodArray && moodArray.length != 0 ? (
        <View
          style={{
            flex: 0.8,
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}>
          <Text
            style={{
              alignSelf: 'flex-start',
              marginHorizontal: '10%',
              fontFamily: font.mainFont,
              marginBottom: 3,
            }}>
            이번 달 {nick}님의 감정은
          </Text>
          <View
            style={{
              borderTopWidth: 1,
              borderColor: colorTheme.hexCode,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginHorizontal: '10%',
            }}>
            {moodArray.map(([mood, percent]) => (
              <View
                key={mood}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  //backgroundColor: 'blue',
                  justifyContent: 'center',
                }}>
                <FastImage
                  source={
                    mood === 'smile'
                      ? require('../image/smile_gif.gif')
                      : mood === 'sad'
                      ? require('../image/sad_gif.gif')
                      : mood === 'neutral'
                      ? require('../image/neutral_gif.gif')
                      : mood === 'angry'
                      ? require('../image/angry_gif.gif')
                      : null // 기본 이미지
                  }
                  style={{
                    width:
                      percent >= 50
                        ? '90%'
                        : percent >= 40
                        ? '80%'
                        : percent >= 30
                        ? '70%'
                        : percent >= 20
                        ? '60%'
                        : '50%',
                    height: '50%',
                    // backgroundColor: 'blue',
                    //alignItems: 'flex-end',
                  }}
                  // resizeMode="stretch"
                  resizeMode={FastImage.resizeMode.contain}
                />
                <Text style={{fontFamily: font.mainFont}}>{percent}%</Text>
              </View>
            ))}
          </View>
          <View
            style={{
              ...styles.container,
              // borderWidth: colorTheme.color === 'black' ? 1 : 0,
              backgroundColor: colorTheme.hexCode2,
            }}>
            <View
              style={{
                ...styles.triangle,
                borderBottomColor: colorTheme.hexCode2,
              }}></View>
            <View
              style={{
                ...styles.triangle,
                borderBottomColor: colorTheme.hexCode2,
                top: -18,
              }}></View>
            <RenderMoodMent ment={ment} />
          </View>
        </View>
      ) : (
        <View
          style={{flex: 0.8, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{fontFamily: font.mainFont}}>
            이번 달 다이어리가 하나도 없어요
          </Text>
          {/* <Entypo
            name="emoji-sad"
            size={20}
            color={colorTheme.hexCode2}
            style={{top: 15}}
          /> */}
        </View>
      )}
      <View
        style={{
          flex: 0.7,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <TouchableOpacity
          style={{
            height: 44,
            justifyContent: 'center',
          }}
          onPress={() => {
            setColorThemeModalStatus(true);
          }}>
          <Text style={{fontFamily: font.mainFont}}>테마 색상 변경</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            height: 44,
            justifyContent: 'center',
          }}
          onPress={() => {
            setUserInfoModalStatus(true);
          }}>
          <Text style={{fontFamily: font.mainFont}}>회원 정보</Text>
        </TouchableOpacity>
        <Modal2
          isVisible={userInfoModalStatus}
          style={{alignItems: 'center'}}
          onBackdropPress={() => {
            setTempNick(nick);
            setTempBirth(birth);
            setUserInfoModalStatus(false);
          }}>
          <View
            style={{
              width: '70%',
              // flex: 0.2,
              height: 150,
              backgroundColor: 'white',
              borderRadius: 15,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View style={{flexDirection: 'row', marginBottom: 12}}>
              <Text
                style={{
                  fontFamily: font.mainFont,
                  marginRight: 5,
                  paddingTop: Platform.OS == 'ios' ? 0 : 18,
                  // backgroundColor: 'pink',
                  // textAlign: 'center',
                }}>
                닉네임:
              </Text>
              <TextInput
                style={{
                  borderBottomWidth: 0.3,
                  paddingBottom: -20,
                  width: 60,
                  textAlign: 'center',
                  // backgroundColor: 'pink',
                  // height: 40,
                  // color: 'grey',
                  fontFamily: font.mainFont,
                }}
                value={tempNick}
                onChangeText={setTempNick}></TextInput>
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text style={{fontFamily: font.mainFont, marginRight: 5}}>
                생일:
              </Text>
              <TouchableOpacity
                style={{borderBottomWidth: 0.3}}
                onPress={() => setOpenPicker(true)}>
                <Text
                  style={{
                    fontFamily: font.mainFont,
                    marginBottom: Platform.OS == 'ios' ? 0 : 5,
                  }}>
                  {tempBirth}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={{
                // backgroundColor: 'pink',
                position: 'relative',
                top: Platform.OS == 'ios' ? 22 : 10,
                left: 90,
              }}
              onPress={() => {
                modifyInfo();
                setUserInfoModalStatus(false);
              }}>
              <Text
                style={{
                  color: colorTheme.hexCode,
                  fontFamily: font.boldFont,
                }}>
                수정
              </Text>
            </TouchableOpacity>
          </View>
          <DatePick
            setTempBirth={setTempBirth}
            tempBirth={tempBirth}
            openPicker={openPicker}
            setOpenPicker={setOpenPicker}
          />
          {/* <CustomAlert
            visible={modifyAlert}
            title={'수정 완료'}
            message={''}
            onClose={() => {
              setModifyAlert(false);
            }}
            onCloseButtonText={'확인'}
          /> */}
        </Modal2>
        <TouchableOpacity
          style={{
            height: 44,
            justifyContent: 'center',
          }}
          onPress={() => {
            setOpenAlert(true);
          }}>
          <Text style={{fontFamily: font.mainFont, marginTop: '3%'}}>
            로그아웃
          </Text>
        </TouchableOpacity>
        <CustomAlert
          visible={openAlert}
          title={'로그아웃 하시겠습니까?'}
          message={''}
          onConfirm={() => {
            AsyncStorage.removeItem('userData');
            AsyncStorage.removeItem('jwtToken');
            setUser('none');
            setNick('none');
            setBirth('none');
            setOpenAlert(false);
            setTimeout(() => {
              // join_success(id);
              navigation.replace('Addinfo');
            }, 500);
          }}
          onClose={() => {
            setOpenAlert(false);
          }}
          onConfirmButtonText={'확인'}
          onCloseButtonText={'취소'}
        />
        <TouchableOpacity
          style={{
            // backgroundColor: 'pink',
            height: 44,
            justifyContent: 'center',
          }}
          onPress={() => {
            setClearAlert(true);
          }}>
          <Text style={{fontFamily: font.mainFont, marginTop: '3%'}}>탈퇴</Text>
        </TouchableOpacity>
        <CustomAlert
          visible={clearAlert}
          title={'회원 탈퇴'}
          message={`${nick}님의 기록이 모두 사라집니다. 탈퇴하시겠습니까?`}
          onConfirm={async () => {
            await deleteImages();
            deleteMemories();
            deleteAccount();
            setUser('none');
            setNick('none');
            AsyncStorage.removeItem('userData');
            setColorTheme({
              color: 'defaultColor',
              hexCode: '#000000',
              hexCode2: '#000000',
            });
            AsyncStorage.removeItem('color');
            AsyncStorage.removeItem('@item');
            //색도 초기화?
            // setClearAlert(false);
            setTimeout(() => {
              // join_success(id);
              navigation.replace('Addinfo');
            }, 500);
          }}
          onClose={() => {
            setClearAlert(false);
          }}
          onConfirmButtonText={'확인'}
          onCloseButtonText={'취소'}
        />
      </View>
      <ColorThemeModal
        colorThemeModalStatus={colorThemeModalStatus}
        setColorThemeModalStatus={setColorThemeModalStatus}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    width: screenWidth * 0.6,
    height: screenWidth * 0.2,
    borderColor: 'black',
    // borderWidth: 1,
    // backgroundColor: 'white',
    borderRadius: 15,
    // borderStyle: 'dashed',
    padding: 10,
    position: 'relative',
    marginBottom: 10,
    justifyContent: 'center',
  },
  triangle: {
    width: 0,
    width: 0,
    height: 0,
    // borderStyle: 'dashed',
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 17,
    borderRightWidth: 10,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    // borderBottomColor: 'black',
    position: 'absolute',
    top: -20,
    left: '50%',
    marginLeft: -10,
  },
  text: {
    // color: 'black',
    opacity: 0.8,
    padding: 3,
    textAlign: 'center',
    fontFamily: font.mainFont,
  },
});

export default MyPage;
