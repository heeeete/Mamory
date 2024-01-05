import React, {useContext, useEffect} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import font from '../../Styles/font';
import {ThemeContext} from '../Context/ThemeContext';

export default function CustomBottomAlert({visible, title, message, onClose}) {
  //   useEffect(() => {
  //     console.log('asdasd');
  //     if (visible) {
  //       setTimeout(() => {
  //         console.log('QQ');
  //         onClose();
  //         console.log(visible);
  //       }, 1000); // 1초 후에 onClose 호출
  //     }
  //   }, [visible]); // visible 또는 onClose가 변경되면 useEffect 실행

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.containerView}>
        <Text>{title}</Text>
        <TouchableOpacity onPress={() => onClose()}>
          <Text>asd</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  containerView: {
    marginTop: '100%',
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'red', // or any color you want
  },
});
