import Checkbox from 'expo-checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Text,
  View,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
  Modal,
  TextInput,
  SafeAreaView,
  Linking,
} from 'react-native';
import {useState, useEffect, useCallback, useContext} from 'react';
import {styles} from '../Styles/styles';
import MySwitch from './component/Switch';
import DatePicker from 'react-native-date-picker';
import * as React from 'react';
import {
  Button,
  // TextInput,
  Provider as PaperProvider,
  ActivityIndicator,
} from 'react-native-paper';
import OpenAddModal from './Todoaddmodal';
import DraggableFlatList from 'react-native-draggable-flatlist';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FastImage from 'react-native-fast-image';
import {ThemeContext} from './Context/ThemeContext';
import {papertheme} from '../Styles/react-native-paper-theme'; // theme.js에서 theme 가져오기
import font from '../Styles/font';
import CustomAlert from './component/CustomAlert';
import {Shadow} from 'react-native-shadow-2';
import {check, PERMISSIONS, RESULTS, request} from 'react-native-permissions';
import PushNotification, {Importance} from 'react-native-push-notification';

const STORAGE_KEY = '@item';
const channelId = 'Todo';

PushNotification.createChannel({
  channelId: channelId, // (required)
  channelName: 'Todo Notification', // (required)
  soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
  importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
  vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
});

function cancelNotification(id) {
  PushNotification.cancelLocalNotification(id);
}

function createPushNotification(todo) {
  // console.log(todo.id);
  PushNotification.localNotificationSchedule({
    channelId: channelId,
    id: todo.id,
    message: todo.text,
    date: todo.date,
    // repeatType: 'day', // 매일 반복
  });
}

const requestNotificationPermission = async (
  setIsPermissionAlarmModal,
  setCurrentAlarm,
) => {
  const result = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
  if (result === RESULTS.DENIED) return setCurrentAlarm(false); //요청 가능

  switch (result) {
    case RESULTS.BLOCKED: //권한 거부됨: 일차적으로 권한 요청 후 여러번 거절시 권한 상태가 BLOCKED 돼어 요청 불가
      return setIsPermissionAlarmModal(true); //요청 불가시 직접 설정으로 이동
    default:
      break;
  }
};

function PermissionModal({
  isPermissionAlarmModal,
  setIsPermissionAlarmModal,
  setCurrentAlarm,
}) {
  return (
    <CustomAlert
      visible={isPermissionAlarmModal}
      title={'알림 권한 필요'}
      message={'알림을 받으려면 설정에서 알림 권한을 활성화해주세요.'}
      onConfirmButtonText={'확인'}
      onCloseButtonText={'취소'}
      onConfirm={() => Linking.openSettings()}
      onClose={() => {
        setCurrentAlarm(false);
        setIsPermissionAlarmModal(false);
      }}
    />
  );
}

function TodoItem({
  todo,
  index,
  modifyToggleModal,
  toggleCheck,
  backgroundColor,
  drag,
  isActive,
}) {
  const {colorTheme} = useContext(ThemeContext);

  if (!todo) return;
  return (
    <TouchableOpacity
      style={{paddingHorizontal: '5.5%'}}
      onPress={() => modifyToggleModal(todo)}
      onLongPress={drag}>
      <Shadow
        startColor={colorTheme.hexCode2}
        offset={[0, 3]}
        distance={1}
        style={{
          ...styles.todo,
          backgroundColor: backgroundColor,
        }}>
        {todo.maintain ? (
          <FontAwesome
            name="star"
            size={15}
            color={colorTheme.hexCode2}
            style={{marginRight: 10}}
          />
        ) : null}
        <Text
          style={[
            todo.isSwitch
              ? {
                  ...styles.todoText,
                  color: 'grey',
                  textDecorationLine: 'line-through',
                }
              : styles.todoText,
          ]}>
          {todo.text}
        </Text>
        <MySwitch
          onValueChange={() => toggleCheck(index)}
          value={todo.isSwitch}
        />
      </Shadow>
    </TouchableOpacity>
  );
}

function EditTodo({
  todo,
  index,
  toggleCheckBox,
  checkBoxStyles,
  backgroundColor,
}) {
  const {colorTheme} = useContext(ThemeContext);
  return (
    <TouchableOpacity
      onPress={() => toggleCheckBox(index)}
      style={{paddingHorizontal: '5.5%'}}>
      <Shadow
        startColor={colorTheme.hexCode2}
        offset={[2, 3]}
        distance={1}
        style={{...styles.todo, backgroundColor: backgroundColor}}>
        <Animated.View style={[checkBoxStyles]}>
          <Checkbox
            onValueChange={() => toggleCheckBox(index)}
            value={todo.isChecked}
            color={todo.isChecked ? colorTheme.hexCode : undefined}
            style={styles.CheckBox}
          />
          {todo.maintain ? (
            <FontAwesome
              name="star"
              size={15}
              color={colorTheme.hexCode2}
              style={{marginRight: 10}}
            />
          ) : null}
          <Text
            style={[
              todo.isSwitch
                ? {
                    ...styles.todoText,
                    color: 'grey',
                    textDecorationLine: 'line-through',
                  }
                : styles.todoText,
            ]}>
            {todo.text}
          </Text>
        </Animated.View>
      </Shadow>
    </TouchableOpacity>
  );
}

function RenderEdit({todos, setTodos, saveTodos, setEdit}) {
  const [clearAlert, setClearAlert] = useState(false);
  const [selectAlert, setSelectAlert] = useState(false);
  const checkedTodos = todos.filter(todo => todo.isChecked);
  const checkCount = checkedTodos.length;
  const todosLen = todos.length;

  // console.log(checkedTodos);
  const clearAllData = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('All data cleared successfully.');
    } catch (error) {
      console.log('Failed to clear data:', error);
    }
  };

  const clear = async () => {
    PushNotification.cancelAllLocalNotifications();
    await clearAllData();
    setTodos([]);
    setEdit();
  };

  const selectDelete = async () => {
    checkedTodos.map(todo => cancelNotification(todo.id));
    const newTodos = todos.filter(todo => !checkedTodos.includes(todo));
    setTodos(newTodos);
    await saveTodos(newTodos);
    setEdit();
  };

  return (
    <View style={styles.edit}>
      <TouchableOpacity
        style={{
          width: '50%',
          borderTopWidth: 1,
          borderRightWidth: 0.5,
          borderTopRightRadius: 10,
          borderColor: 'lightgrey',
        }}
        onPress={() => setSelectAlert(true)}>
        <Text style={{...styles.editText, color: 'red'}}>삭제</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          width: '50%',
          borderTopWidth: 1,
          borderLeftWidth: 0.5,
          borderTopLeftRadius: 10,
          borderColor: 'lightgrey',
        }}
        onPress={() => {
          setClearAlert(true);
        }}>
        <Text style={styles.editText}>전체삭제</Text>
      </TouchableOpacity>
      <CustomAlert
        visible={clearAlert}
        title={
          todosLen
            ? '모든 할 일을 삭제하시겠습니까?'
            : '삭제할 항목이 없습니다.'
        }
        message={todosLen ? "삭제하시려면 '확인'을 눌러 주세요." : ''}
        onClose={() => setClearAlert(false)}
        onConfirm={todosLen ? clear : null}
        onCloseButtonText={todosLen ? '취소' : '확인'}
        onConfirmButtonText={todosLen ? '확인' : null}
      />
      <CustomAlert
        visible={selectAlert}
        title={
          todosLen
            ? checkCount
              ? `${checkCount}개의 항목을 삭제하시겠습니까?`
              : '항목을 선택해 주세요'
            : '삭제할 항목이 없습니다.'
        }
        message={
          todosLen
            ? checkCount
              ? "삭제하시려면 '확인'을 눌러 주세요."
              : ''
            : ''
        }
        onClose={() => setSelectAlert(false)}
        onCloseButtonText={todosLen ? (checkCount ? '취소' : '확인') : '확인'}
        onConfirmButtonText={todosLen ? (checkCount ? '확인' : null) : null}
        onConfirm={checkCount ? selectDelete : null}
      />
    </View>
  );
}

function Todo({navigation}) {
  const [isSwitch, setIsSwitch] = useState(false);
  const [maintainStatus, setMaintainStatus] = useState(false);
  const [edit, setEdit] = useState(false);
  const [text, setText] = useState('');
  const [todos, setTodos] = useState([]);
  const [load, setLoad] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentTodo, setCurrentTodo] = useState([]);
  // const [date, setDate] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [alarm, setAlarm] = useState(false);
  const [modifyTodoModalStatus, setModifyTodoModalStatus] = useState(false);
  const [localMaintainStatus, setLocalMaintainStatus] = useState(false);
  const [currentAlarm, setCurrentAlarm] = useState(false);
  const [date, setDate] = useState(new Date());
  const {colorTheme} = useContext(ThemeContext);
  const [isPermissionAlarmModal, setIsPermissionAlarmModal] = useState(false);

  const todosLen = todos.length;

  useEffect(() => {
    if (currentAlarm) {
      requestNotificationPermission(setIsPermissionAlarmModal, setCurrentAlarm);
    }
  }, [currentAlarm]);

  useEffect(() => {
    const fetchTodos = async () => {
      await loadTodos();
      setLoad(false);
    };
    fetchTodos();
  }, []);

  /* ======================Todo 다음날 오전6시 넘으면 자동 삭제=============================== */
  useEffect(() => {
    if (load === false) {
      const now = new Date();
      const discardTodos = todos.filter(todo => !todo.maintain);
      if (!discardTodos.length) {
        return;
      }
      const firstArrayCreateDay = discardTodos[0].createDay;
      if (firstArrayCreateDay - now.getDate() && now.getHours() >= 6) {
        const deleteKeys = discardTodos
          .filter(todo => todo.createDay === firstArrayCreateDay)
          .map(todo => todos.indexOf(todo));
        const newTodos = [...todos];
        for (const index of deleteKeys) {
          newTodos.splice(index, 1);
        }
        setTodos(newTodos);
        saveTodos(newTodos);
      }
    }
  });
  /* ======================Todo 다음날 오전6시 넘으면 자동 삭제=============================== */

  /* ======================애니메이션=============================== */
  const checkBoxAnimatedValue = useState(new Animated.Value(-100))[0];
  const checkBoxStyles = {
    transform: [{translateX: checkBoxAnimatedValue}],
    flexDirection: 'row',
    alignItems: 'center',
  };

  const startAnimation = Value => {
    Animated.timing(Value, {
      toValue: 0,
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };
  /* ======================애니메이션=============================== */

  const modifyAlarmSwitch = () => {
    if (currentTodo) {
      if (currentAlarm === true) setCurrentDate(new Date());
      setCurrentAlarm(prevStatus => !prevStatus);
    }
  };

  const alarmSwitch = () => {
    setDate(new Date());
    setAlarm(prevStatus => !prevStatus);
  };

  const maintainSwitch = () => {
    setMaintainStatus(prevStatus => !prevStatus);
  };

  const toggleModal = () => {
    if (maintainStatus) setMaintainStatus(prevStatus => !prevStatus);
    if (alarm) setAlarm(prevStatus => !prevStatus);
    if (text) setText('');
    setIsModalVisible(!isModalVisible);
  };

  const onChangeText = payload => {
    setText(payload);
  };

  const saveTodos = async todos => {
    try {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.log('Failed to svaTodos', error);
    }
  };

  const IsEdit = () => {
    const {colorTheme} = useContext(ThemeContext);

    return edit ? (
      <RenderEdit
        todos={todos}
        setTodos={setTodos}
        saveTodos={saveTodos}
        setEdit={setEdit}
      />
    ) : (
      <View style={styles.addTodo}>
        <Button
          style={{
            backgroundColor: colorTheme.hexCode,
            opacity: 0.7,
            borderRadius: 10,
            alignItems: 'center',
            marginVertical: 6,
          }}
          mode="contained"
          onPress={() => toggleModal()}>
          <FontAwesome name="calendar-plus-o" size={14} color="white" />
          <Text style={{fontFamily: font.boldFont, color: 'white'}}>
            {' '}
            할 일 추가
          </Text>
        </Button>
      </View>
    );
  };

  const Edit = () => {
    setEdit(!edit);
    checkBoxAnimatedValue.setValue(-30); // reset the value
    startAnimation(checkBoxAnimatedValue);

    const newTodos = JSON.parse(JSON.stringify(todos));
    Object.keys(newTodos).forEach(key => {
      newTodos[key].isChecked = false;
    });
    setTodos(newTodos);
  };

  const loadTodos = async () => {
    try {
      const item = await AsyncStorage.getItem(STORAGE_KEY);
      if (item === null) {
        setTodos([]);
      } else {
        setTodos(JSON.parse(item));
      }
    } catch (error) {
      console.log('Local Storage Error');
    }
  };

  // ===================================Todo 수정==================================================
  const updateTodo = async () => {
    const updateTodos = JSON.parse(JSON.stringify(todos));
    const index = todos.findIndex(todo => todo === currentTodo);
    if (text) {
      updateTodos[index].text = text;
    }
    updateTodos[index].maintain = localMaintainStatus;
    updateTodos[index].alarm = currentAlarm;
    updateTodos[index].date = currentDate;
    setCurrentDate(new Date());
    setTodos(updateTodos);
    await saveTodos(updateTodos);
    setText('');
    setModifyTodoModalStatus(!modifyTodoModalStatus);
  };

  const resetTodo = async () => {
    setText('');
    setModifyTodoModalStatus(!modifyTodoModalStatus);
  };

  const modifyToggleModal = todo => {
    setText(todo.text);
    setCurrentTodo(todo);
    setLocalMaintainStatus(todo.maintain);
    setCurrentAlarm(todo.alarm);
    setCurrentDate(todo.date);
    setModifyTodoModalStatus(!modifyTodoModalStatus);
  };

  const modifyMaintainStatus = () => {
    if (currentTodo) {
      setLocalMaintainStatus(prevStatus => !prevStatus);
    }
  };
  // ======================================================================================

  const addTodo = async () => {
    if (text === '') return toggleModal();
    const newTodo = {
      id: Math.floor(Date.now() / 1000000), //푸시 알람에서 고유한 id를 주기 위해 사용, Date.now가 값이 너무 커서 나누고 소수점 버리고 정수로 사용
      text,
      alarm,
      isSwitch,
      isChecked: false, //편집에서 선택 삭제 변수
      maintain: maintainStatus ? true : false, //투두 유지 변수
      createDay: new Date().getDate(), //다음날 자동 삭제 기능을 위한 투두 생성일
      date: date,
    };
    if (newTodo.alarm) createPushNotification(newTodo);
    const newTodos = [...todos, newTodo];
    setTodos(newTodos);
    await saveTodos(newTodos);
    setDate(new Date());
    setText('');
    toggleModal();
  };

  const toggleCheck = async index => {
    const newTodos = JSON.parse(JSON.stringify(todos));
    newTodos[index].isSwitch = !newTodos[index].isSwitch;
    setTodos(newTodos);
    await saveTodos(newTodos);
  };

  const toggleCheckBox = index => {
    const newTodos = JSON.parse(JSON.stringify(todos));
    newTodos[index].isChecked = !newTodos[index].isChecked;
    setTodos(newTodos);
  };
  // clearAllData();
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <PaperProvider theme={papertheme}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.hText}>오늘 할 일</Text>
            <TouchableOpacity
              style={{
                // backgroundColor: 'red',
                width: 44,
                height: 44,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => Edit()}>
              <Text style={styles.editBtn}>{edit ? '닫기' : '삭제'}</Text>
            </TouchableOpacity>
          </View>
          <View style={{flex: 1}}>
            {
              load ? (
                <ActivityIndicator
                  animating={true}
                  size={'L'}
                  color={colorTheme.hexCode}
                />
              ) : todosLen === 0 ? (
                <View style={styles.undefinedTodoView}>
                  <Text style={styles.undefinedTodoText}>
                    현재 할 일이 없습니다{'\n'}오늘 해야 할 일을 기록해보세요
                  </Text>
                </View>
              ) : (
                <DraggableFlatList
                  style={{height: '100%'}}
                  contentContainerStyle={{paddingTop: '3%'}}
                  data={todos}
                  renderItem={({item: todo, getIndex, drag, isActive}) => {
                    index = getIndex();
                    const isOdd = index % 2 !== 0;
                    const backgroundColor = isOdd
                      ? 'white'
                      : 'rgb(248, 248, 248)';
                    if (edit) {
                      return (
                        <EditTodo
                          key={index}
                          index={index}
                          todo={todo}
                          toggleCheckBox={toggleCheckBox}
                          checkBoxStyles={checkBoxStyles}
                          backgroundColor={backgroundColor}
                          isActive={isActive}
                          drag={drag}
                        />
                      );
                    } else {
                      return (
                        <TodoItem
                          key={index}
                          index={index}
                          todo={todo}
                          toggleCheckBox={toggleCheckBox}
                          toggleCheck={toggleCheck}
                          modifyToggleModal={modifyToggleModal}
                          backgroundColor={backgroundColor}
                          isActive={isActive}
                          drag={drag}
                        />
                      );
                    }
                  }}
                  keyExtractor={(item, index) => `draggable-item-${index}`}
                  onDragEnd={({data}) => {
                    setTodos(data);
                    saveTodos(data);
                  }}
                />
              )
              //===============================ToDo_List================================//
            }
          </View>
          {/* edit 의 상태를 확인 하여 어떤 Btn을 랜더링 할지 확인 */}
          <IsEdit />
          <OpenAddModal
            setIsModalVisible={setIsModalVisible}
            toggleModal={toggleModal}
            addTodo={addTodo}
            maintainSwitch={maintainSwitch}
            alarmSwitch={alarmSwitch}
            isModalVisible={isModalVisible}
            text={text}
            onChangeText={onChangeText}
            maintainStatus={maintainStatus}
            alarm={alarm}
            date={date}
            setDate={setDate}
          />
          {/* =====================================밑에 수정 투투=========================================== */}
          {currentTodo ? (
            <Modal
              style={{marginTop: 300}}
              animationType="slide"
              visible={modifyTodoModalStatus}
              presentationStyle="pageSheet"
              onRequestClose={() => {
                setModifyTodoModalStatus(false);
              }}>
              <View style={{flex: 1, marginHorizontal: 20}}>
                <View style={styles.addTodoHeader}>
                  <TouchableOpacity style={{}} onPress={() => resetTodo()}>
                    <Text
                      style={{
                        padding: 15,
                        fontFamily: 'IMHyemin-Regular',
                      }}>
                      취소
                    </Text>
                  </TouchableOpacity>
                  <Text style={{fontSize: 22, fontFamily: 'IMHyemin-Regular'}}>
                    수정하기
                  </Text>
                  <TouchableOpacity onPress={() => updateTodo()}>
                    <Text
                      style={{
                        padding: 15,
                        fontFamily: 'IMHyemin-Regular',
                      }}>
                      저장
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={{flex: 1}}>
                  <TextInput
                    value={text}
                    returnKeyType="done"
                    onChangeText={onChangeText}
                    style={{
                      fontFamily: 'IMHyemin-Regular',
                      borderBottomWidth: 1,
                      marginHorizontal: 10,
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                      borderColor: 'grey',
                      opacity: 0.7,
                      marginBottom: 3,
                    }}
                    placeholder={''}></TextInput>
                  <View style={styles.addText}>
                    <View>
                      <Text
                        style={{fontSize: 17, fontFamily: 'IMHyemin-Regular'}}>
                        유지
                      </Text>
                      <Text
                        style={{
                          fontSize: 10,
                          marginTop: 5,
                          color: 'grey',
                        }}>
                        체크하지 않으시면 다음날 오전 6시에 자동 삭제됩니다.
                      </Text>
                    </View>
                    <MySwitch
                      onValueChange={() => modifyMaintainStatus()}
                      value={localMaintainStatus}
                    />
                  </View>
                  <View
                    style={{
                      ...styles.addText,
                      alignItems: 'center',
                    }}>
                    <View>
                      <Text
                        style={{fontSize: 17, fontFamily: 'IMHyemin-Regular'}}>
                        알람
                      </Text>
                    </View>
                    <MySwitch
                      onValueChange={() => modifyAlarmSwitch()}
                      value={currentAlarm}
                    />
                  </View>
                  {currentAlarm ? (
                    <DatePicker
                      date={new Date(currentDate)}
                      onDateChange={setCurrentDate}
                      minimumDate={new Date()}
                    />
                  ) : null}
                </View>
              </View>
              <PermissionModal
                isPermissionAlarmModal={isPermissionAlarmModal}
                setIsPermissionAlarmModal={setIsPermissionAlarmModal}
                setCurrentAlarm={setCurrentAlarm}
              />
            </Modal>
          ) : null}
        </View>
      </PaperProvider>
    </SafeAreaView>
  );
}

export default Todo;
