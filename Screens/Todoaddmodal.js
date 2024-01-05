import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Linking,
  TextInput,
} from 'react-native';
import MySwitch from './component/Switch';
import DatePicker from 'react-native-date-picker';
import {styles} from '../Styles/styles';
// import {TextInput} from 'react-native-paper';
import {check, PERMISSIONS, RESULTS, request} from 'react-native-permissions';
import CustomAlert from './component/CustomAlert';

const requestNotificationPermission = async (
  setIsPermissionAlarmModal,
  alarmSwitch,
) => {
  const result = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
  if (result === RESULTS.DENIED) return alarmSwitch(); //요청 가능

  switch (result) {
    case RESULTS.BLOCKED: //권한 거부됨: 일차적으로 권한 요청 후 여러번 거절시 권한 상태가 BLOCKED 돼어 요청 불가
      return setIsPermissionAlarmModal(true); //요청 불가시 직접 설정으로 이동
    default:
      break;
  }
};

function OpenAddModal({
  setIsModalVisible,
  toggleModal,
  addTodo,
  maintainSwitch,
  alarmSwitch,
  isModalVisible,
  text,
  onChangeText,
  maintainStatus,
  alarm,
  date,
  setDate,
}) {
  const [isPermissionAlarmModal, setIsPermissionAlarmModal] = useState(false);
  useEffect(() => {
    if (alarm) {
      requestNotificationPermission(setIsPermissionAlarmModal, alarmSwitch);
    }
  }, [alarm]);

  return (
    <Modal
      style={{marginTop: 300}}
      animationType="slide"
      visible={isModalVisible}
      presentationStyle="pageSheet"
      onRequestClose={() => {
        setIsModalVisible(false);
      }}>
      <View style={{flex: 1, marginHorizontal: 20}}>
        <View style={styles.addTodoHeader}>
          <TouchableOpacity onPress={() => toggleModal()}>
            <Text
              style={{
                padding: 15,
                fontFamily: 'IMHyemin-Regular',
              }}>
              취소
            </Text>
          </TouchableOpacity>
          <Text style={{fontSize: 19, fontFamily: 'IMHyemin-Regular'}}>
            할 일 추가
          </Text>
          <TouchableOpacity onPress={() => addTodo()}>
            <Text style={{padding: 15, fontFamily: 'IMHyemin-Regular'}}>
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
              // ...styles.Input,
              borderBottomWidth: 1,
              marginHorizontal: 10,
              fontFamily: 'IMHyemin-Regular',
              paddingHorizontal: 10,
              paddingVertical: 3,
              borderColor: 'grey',
              opacity: 0.7,
              marginBottom: 3,
            }}
            placeholder={'Add a To Do'}></TextInput>
          <View style={styles.addText}>
            <View>
              <Text style={{fontSize: 17, fontFamily: 'IMHyemin-Regular'}}>
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
              onValueChange={() => maintainSwitch()}
              value={maintainStatus}
            />
          </View>
          <View style={{...styles.addText, alignItems: 'center'}}>
            <View>
              <Text style={{fontSize: 17, fontFamily: 'IMHyemin-Regular'}}>
                알람
              </Text>
            </View>
            <MySwitch onValueChange={() => alarmSwitch()} value={alarm} />
          </View>
          {alarm ? (
            <DatePicker
              date={date}
              onDateChange={setDate}
              minimumDate={new Date()}
              textColor="black"
              locale="ko"
            />
          ) : null}
        </View>
      </View>
      <CustomAlert
        visible={isPermissionAlarmModal}
        title={'알림 권한 필요'}
        message={'알림을 받으려면 설정에서 알림 권한을 활성화해주세요.'}
        onConfirmButtonText={'확인'}
        onCloseButtonText={'취소'}
        onConfirm={() => Linking.openSettings()}
        onClose={() => {
          alarmSwitch();
          setIsPermissionAlarmModal(false);
        }}
      />
    </Modal>
  );
}

export default OpenAddModal;
