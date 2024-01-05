import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Button,
  FlatList,
  Platform,
  Dimensions,
} from 'react-native';
import {useState, useEffect, useContext} from 'react';
import {CalendarList, Calendar, LocaleConfig} from 'react-native-calendars';
import Modal from 'react-native-modal';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
//import { Picker } from "@react-native-picker/picker";
import CalendarHeader from 'react-native-calendars/src/calendar/header';
import {theme} from '../colors';
import {format} from 'date-fns';
import axios from 'axios';
import FastImage from 'react-native-fast-image';
import _ from 'lodash';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ThemeContext} from './Context/ThemeContext';
import font from '../Styles/font';
import {screensEnabled} from 'react-native-screens';

const serverIP = '43.200.88.208';
const screenHeight = Dimensions.get('window').height;

function renderCustomHeader({date}) {
  // const renderCustomHeader = calendarState => {
  //   // const currentMonth = calendarState.currentMonth; // 현재 월 정보
  //   // const currentYear = calendarState.currentYear; // 현재 년도 정보
  return (
    <View>
      <Text>{/* {date.year}년 {date.month}월 */}</Text>
      {/* <Text>여기에 사용자 정의 헤더를 추가할 수 있습니다.</Text> */}
    </View>
  );
}

export default function Main({navigation}) {
  const [markedDates, setMarkedDates] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState('');
  const [selectHeader, setSelectHeader] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const months = Array.from({length: 12}, (_, index) => index + 1);
  const {theme, setTheme} = useContext(ThemeContext);
  const {colorTheme} = useContext(ThemeContext);
  const {user} = useContext(ThemeContext);
  const {nick} = useContext(ThemeContext);
  const {birth} = useContext(ThemeContext);

  // console.log('cc');
  // const fetchUserData = async () => {
  //   try {
  //     console.log(user);
  //     const response = await axios.get(`http://${serverIP}:3003/userData`, {
  //       params: {
  //         user: user,
  //       },
  //     });
  //     console.log('3');
  //     console.log(response.data[0]);
  //     console.log(response.data[0].birthday.substring(0, 10));
  //     console.log(response.data[0].nickName);
  //     // console.log(response.data); // 응답 데이터 출력
  //     // 데이터 처리 및 상태 업데이트 등을 이어서 수행할 수 있습니다.
  //     await AsyncStorage.setItem(
  //       'userData',
  //       JSON.stringify({
  //         id: user,
  //         nickname: response.data[0].nickName,
  //         birthday: response.data[0].birthday.substring(0, 10),
  //       }),
  //     );
  //     setNick(response.data[0].nickName);
  //     setBirth(response.data[0].birthday.substring(0, 10));
  //   } catch (error) {
  //     console.log(error, 'dpdpdpdpfjfjfjfj');
  //   }
  // };

  // useEffect(() => {
  //   if (user) fetchUserData();
  // }, [user]);

  useEffect(() => {
    // console.log(markedDates);
    const refreshDiaries = navigation.addListener('focus', () => {
      //navigation.addListener를 사용하여 focus 이벤트를 수신
      //React Navigation에서 화면 간 이동이 발생할 때 해당 화면이 "focus"되는 것으로 간주
      //focus 이벤트는 해당 화면이 화면 스택에 포함될 때마다 발생하며, 페이지가 다시 보여질 때마다 호출
      // 수정된 데이터로 다이어리를 다시 불러오는 비동기 호출 또는 상태 업데이트 등
      fetchDiarydates();
    });
    return () => {
      refreshDiaries();
    };
  }, [navigation, markedDates]);

  const handleHeaderClick = () => {
    setIsModalOpen(true);
  };

  const increase = () => {
    setSelectedYear(selectedYear + 1);
  };
  const decrease = () => {
    setSelectedYear(selectedYear - 1);
  };

  const handleMonthSelect = month => {
    setSelectedYear(selectedYear);
    setSelectedMonth(month);
  };

  const convertTime = item => {
    const date = new Date(item.date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  };

  const handleVisibleMonthsChange = _.debounce(month => {
    const firstMonth = month[0];
    setSelectedYear(firstMonth.year);
    setSelectedMonth(firstMonth.month);
  }, 80);

  const fetchMood = async datestring => {
    try {
      const response = await axios.get(`http://${serverIP}:3003/checkMood`, {
        params: {
          user: user,
          date: datestring,
        },
      });
      const mood = response.data; // mood 값을 가져옴
      return mood;
    } catch (error) {
      console.log(error);
    }
  };

  const CustomDayComponent = ({date, state, marked, maxDate, onPress}) => {
    const [mood, setMood] = useState(null);
    const {colorTheme} = useContext(ThemeContext);
    const {birth} = useContext(ThemeContext);
    const dayOfWeek = new Date(date.year, date.month - 1, date.day).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    // console.log(colorTheme.hexCode, 'durl!!!!!!!!!!!!!!!!');
    useEffect(() => {
      if (marked) {
        fetchMood(date.dateString)
          .then(mood => {
            //console.log(mood);
            setMood(mood); // mood를 상태에 설정하고 이미지 로딩 후 컴포넌트를 다시 렌더링
          })
          .catch(error => {
            console.log(error);
          });
      }
    }, [date.dateString, marked]);
    const isDisabled =
      state === 'disabled' || (maxDate && date.dateString > maxDate);
    const handlePress = () => {
      if (!isDisabled) {
        onPress(date);
      }
    };
    return (
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          height: 44,
          width: 44,
        }}>
        {/* {date.dateString === birth && marked && (
          <MaterialIcons name="cake" size={33} color={colorTheme.hexCode2} />
        )} */}
        {marked ? null : isDisabled ? (
          <View
            style={{
              opacity: 0.5, // disabled 상태일 때 투명도 조절
            }}>
            {date.dateString === birth ? (
              <MaterialIcons
                name="cake"
                size={33}
                color={colorTheme.hexCode2}
              />
            ) : (
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: 'IMHyemin-Regular',
                  color: isWeekend
                    ? colorTheme.color === 'black'
                      ? 'red'
                      : colorTheme.hexCode
                    : {},
                }}>
                {date.day}
              </Text>
            )}
          </View>
        ) : (
          <TouchableOpacity
            style={{
              width: '100%',
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              opacity: 1, // 활성 상태일 때 투명도 조절
            }}
            onPress={handlePress}>
            {date.dateString === birth ? (
              <MaterialIcons
                name="cake"
                size={33}
                color={colorTheme.hexCode2}
              />
            ) : (
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: 'IMHyemin-Regular',
                  color: isWeekend
                    ? colorTheme.color === 'black'
                      ? 'red'
                      : colorTheme.hexCode
                    : {},
                }}>
                {date.day}
              </Text>
            )}
          </TouchableOpacity>
        )}
        {/* {date.dateString === birth && marked && (
          <MaterialIcons name="cake" size={33} color={colorTheme.hexCode2} />
        )} */}
        {marked && mood && mood.length !== 0 && (
          <View style={{alignItems: 'center'}}>
            {date.dateString === birth && (
              <MaterialIcons
                name="cake"
                size={33}
                style={{position: 'absolute', bottom: 13}}
                color={colorTheme.hexCode2}
              />
            )}
            <FastImage
              source={
                mood[0].mood === 'smile'
                  ? require('../image/smile_gif.gif')
                  : mood[0].mood === 'sad'
                  ? require('../image/sad_gif.gif')
                  : mood[0].mood === 'neutral'
                  ? require('../image/neutral_gif.gif')
                  : mood[0].mood === 'angry'
                  ? require('../image/angry_gif.gif')
                  : null // 기본 이미지
              }
              style={{width: 50, height: 40}}
              // resizeMode="stretch"
              resizeMode={FastImage.resizeMode.stretch}
            />
          </View>
        )}
      </View>
    );
  };

  const fetchDiarydates = async () => {
    // console.log(user);
    try {
      const response = await axios.get(`http://${serverIP}:3003/checkDiary`, {
        params: {
          user: user,
        },
      });
      const dateArray = response.data.map(item => convertTime(item));
      const markedDatesObject = {};
      dateArray.forEach(date => {
        markedDatesObject[date] = {
          marked: true,
        };
      });
      // console.log(
      //   JSON.stringify(markedDates) === JSON.stringify(markedDatesObject),
      // );
      if (markedDates.length === 0) return;
      else if (
        JSON.stringify(markedDates) === JSON.stringify(markedDatesObject)
      )
        return;
      setMarkedDates(markedDatesObject);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <View style={styles.body}>
      {!isModalOpen ? (
        <View
          style={{
            marginTop: Platform.OS === 'ios' ? '60%' : '50%',
            justifyContent: 'center',
            alignItems: 'center',
            transform: [{scale: 0.9}],
          }}>
          <TouchableOpacity
            onPress={handleHeaderClick}
            style={{width: 44, height: 44}}>
            <Text
              style={{
                ...styles.header,
                fontFamily: font.mainFont,
                alignSelf: 'center',
              }}>
              {selectedYear}
            </Text>
            <Text
              style={{
                color: colorTheme.hexCode,
                fontSize: 20,
                fontFamily: font.mainFont,
                alignSelf: 'center',
              }}>
              {selectedMonth}
            </Text>
          </TouchableOpacity>
          <CalendarList
            style={styles.Calendar}
            current={`${selectedYear}-${
              selectedMonth < 10 ? '0' + selectedMonth : selectedMonth
            }`}
            horizontal={true}
            onVisibleMonthsChange={handleVisibleMonthsChange}
            renderHeader={() => {
              return null;
            }}
            dayComponent={({date, state}) => (
              <CustomDayComponent
                date={date}
                state={state}
                marked={markedDates[date.dateString]?.marked}
                maxDate={format(new Date(), 'yyyy-MM-dd')}
                onPress={day => {
                  setSelected(day.dateString);
                  navigation.navigate('AddDiary', {date: day});
                }}
              />
            )}
            pagingEnabled={true}
            markedDates={markedDates}
          />
        </View>
      ) : (
        ''
      )}
      <Modal
        style={styles.modalContainer}
        visible={isModalOpen}
        onBackdropPress={() => setIsModalOpen(false)}>
        <View style={styles.modalContent}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              margin: 10,
            }}>
            <TouchableOpacity
              onPress={decrease}
              style={{
                width: 44,
                height: 44,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <AntDesign name="left" size={16} color="black" />
            </TouchableOpacity>
            <Text style={{fontSize: 15, fontFamily: 'IMHyemin-Regular'}}>
              {selectedYear}
            </Text>
            <TouchableOpacity
              onPress={increase}
              style={{
                width: 44,
                height: 44,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <AntDesign name="right" size={16} color="black" />
            </TouchableOpacity>
          </View>
          <FlatList
            //itemContainerStyle={styles.listContainer}
            columnWrapperStyle={{justifyContent: 'space-between'}}
            data={months}
            numColumns={4}
            renderItem={({item}) => (
              <TouchableOpacity
                onPress={() => handleMonthSelect(item)}
                style={styles.itemContainer}>
                <Text
                  style={[
                    styles.itemText,
                    selectedMonth === item
                      ? colorTheme.color === 'black'
                        ? {color: 'red'}
                        : {color: colorTheme.hexCode}
                      : {},
                  ]}>
                  {item}
                </Text>
                {selectedMonth === item && <View style={styles.circle} />}
              </TouchableOpacity>
            )}
            keyExtractor={item => item.toString()}
            contentContainerStyle={styles.listContainer}
          />
          <TouchableOpacity
            style={{
              width: 44,
              height: 44,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              onPress={() => {
                setIsModalOpen(false);
              }}
              style={{fontSize: 18, fontFamily: 'IMHyemin-Regular'}}>
              ok
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  Calendar: {
    // borderWidth: 1,
    borderRadius: 10,
    paddingBottom: 10,
    paddingTop: 5,
    // fontFamily:"IMHyemin-Regular",
  },
  header: {
    fontSize: 14,
    //fontFamily: 'IMHyemin-Regular',
  },
  body: {
    // marginTop: '50%',
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'center',
  },
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    // fontFamily: "IMHyemin-Regular"
  },
  modalContent: {
    // fontFamily: "IMHyemin-Regular",
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    width: '90%',
  },
  itemContainer: {
    width: 44,
    height: 44,
    margin: '5%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedItem: {
    color: theme.press,
  },
  listContainer: {
    justifyContent: 'space-between',
  },
  itemText: {
    fontSize: 15,
    fontFamily: 'IMHyemin-Regular',
  },
  circle: {},
  // circle: {
  //   position: "absolute",
  //   bottom: -0.05, // 선택된 아이템 위로 원을 위치시킴
  //   alignSelf: "center",
  //   width: 10,
  //   height: 10,
  //   borderRadius: 10 / 2,
  //   backgroundColor: theme.base,
  // },
});
