import React, {useContext} from 'react';
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

export default function CustomAlert({
  visible,
  title,
  message,
  onClose,
  onConfirm = null,
  onCloseButtonText = null,
  onConfirmButtonText = null,
}) {
  const {colorTheme} = useContext(ThemeContext);

  const startOnConirm = async () => {
    if (onConfirm) await onConfirm();
    onClose();
  };
  // console.log(onConfirmButtonText);
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonContainer}>
            {onConfirmButtonText && (
              <TouchableOpacity
                style={{
                  ...styles.button,
                  marginRight: 5,
                  backgroundColor: colorTheme.hexCode,
                }}
                onPress={async () => await startOnConirm()}>
                <Text style={styles.buttonText}>{onConfirmButtonText}</Text>
              </TouchableOpacity>
            )}
            {/* {console.log(onConfirmButtonText)} */}
            {onCloseButtonText && (
              <TouchableOpacity
                style={{
                  ...styles.button,
                  marginRight: 5,
                  backgroundColor: colorTheme.hexCode,
                }}
                onPress={onClose}>
                <Text style={styles.buttonText}>{onCloseButtonText}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 22,
  },
  modalView: {
    // margin: 20,
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: font.boldFont,
  },
  message: {
    marginBottom: 13,
    textAlign: 'center',
    fontFamily: font.mainFont,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    padding: 10,
    borderRadius: 5,
    width: '50%',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontFamily: font.boldFont,
  },
});
