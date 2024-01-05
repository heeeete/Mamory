import {
  Text,
  View,
  Button,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Pressable,
  Keyboard,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import React, {useEffect, useState, useRef, useContext} from 'react';
import DatePicker from 'react-native-date-picker';
import axios from 'axios';
import Modal from 'react-native-modal';
import font, {mainFont} from '../Styles/font';
import VibrationComponent from './component/VibrationComponent';
import Image from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ThemeContext} from './Context/ThemeContext';
import {ActivityIndicator} from 'react-native-paper';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FastImage from 'react-native-fast-image';
import {ceil} from 'lodash';
import {setTSpan} from 'react-native-svg/lib/typescript/lib/extract/extractText';
import {response} from 'express';
import {err} from 'react-native-svg/lib/typescript/xml';
import CustomAlert from './component/CustomAlert';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const serverIP = '43.200.88.208';

// const send_email = async (email, setEcode) => {
//   try {
//     const response = await axios.post(`http://${serverIP}:3003/sendEmail`, {
//       email: email, // `params` 대신 `data` 사용
//     });
//     // console.log(response.data);
//     setEcode(response.data.code);
//   } catch (error) {
//     if (error.response.status === 404) {
//       console.log(error.response.data);
//       return false;
//     }
//     //   // console.error('요청 실패: ', error.response.data);
//     //   // 에러 처리 또는 사용자에게 표시할 메시지를 여기서 정의할 수 있습니다.
//     // }
//     console.log(error);
//   }
// };

function DatePick({setBirthday, setOpenpicker, openpicker}) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <DatePicker
      modal
      open={openpicker}
      mode="date"
      date={selectedDate}
      onConfirm={birthday => {
        setOpenpicker(false);
        setSelectedDate(birthday);
        const year = birthday.getFullYear();
        const month = String(birthday.getMonth() + 1).padStart(2, '0');
        const day = String(birthday.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        setBirthday(formattedDate);
      }}
      onCancel={() => {
        setOpenpicker(false);
      }}
    />
  );
}

function SignUpStep1({
  isSignUp,
  closeSignUpModal,
  setID,
  id,
  setPW,
  pw,
  setPW2,
  pw2,
  vibrationRef,
  nextSignUp,
  idLog,
  pwLog,
}) {
  return (
    <Modal
      isVisible={isSignUp}
      animationIn={'slideInRight'}
      animationOut={'slideOutLeft'}
      onBackdropPress={() => closeSignUpModal()}>
      <Pressable
        style={{...styles.modalView, paddingTop: '2%'}}
        onPress={() => Keyboard.dismiss()}>
        <Text style={{alignSelf: 'center', fontFamily: font.mainFont}}>
          1 / 2
        </Text>
        <View style={{...styles.signView}}>
          <Text style={styles.text}>아이디: </Text>
          <TextInput
            onChangeText={text => setID(text)}
            value={id}
            style={styles.signUpTextInput}
            autoFocus={true}
            placeholder="아이디를 입력해 주세요."
          />
        </View>
        <View style={{height: 13, width: '100%'}}>{idLog}</View>
        <View style={{...styles.signView, marginTop: '4%'}}>
          <Text style={styles.text}>비밀번호: </Text>
          <TextInput
            onChangeText={text => setPW(text)}
            value={pw}
            style={styles.signUpTextInput}
            secureTextEntry={true}
            placeholder="비밀번호를 입력해 주세요."
          />
        </View>
        <Text style={[styles.logText, {color: 'black'}]}>
          아이디는 4글자 이상, 20글자 이하, 영문자, 숫자만 가능합니다.
        </Text>
        <View style={styles.signView}>
          <Text style={styles.text}>비밀번호 확인: </Text>
          <TextInput
            onChangeText={text => setPW2(text)}
            value={pw2}
            style={styles.signUpTextInput}
            secureTextEntry={true}
            placeholder="비밀번호를 확인합니다."
          />
        </View>
        <View style={{height: 13, width: '100%'}}>{pwLog}</View>
        <VibrationComponent ref={vibrationRef} style={{alignSelf: 'flex-end'}}>
          <TouchableOpacity
            style={{
              padding: 20,
              left: 15,
            }}
            onPress={() => nextSignUp()}>
            <Text style={{fontFamily: font.boldFont}}>다음</Text>
          </TouchableOpacity>
        </VibrationComponent>
      </Pressable>
    </Modal>
  );
}

function SignUpStep2({
  isSignUp2,
  closeSignUpModal,
  nickName,
  setNickName,
  nickLog,
  setBirthday,
  openpicker,
  setOpenpicker,
  birthday,
  register,
  vibrationRef,
  colorTheme,
  isLodaing,
  setThemeColor,
  email,
  setEmail,
  verify,
  setVerify,
}) {
  const [emailSended, setEmailSended] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [code, setCode] = useState('');
  const [e_code, setEcode] = useState('');
  const [minutes, setMinutes] = useState(3);
  const [seconds, setSeconds] = useState(0);
  const [timeout, setTimeout] = useState(false);
  const [emailCheck, setEmailCheck] = useState(false);

  const Regex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
  const A = Regex.test(email) ? TouchableOpacity : View;

  const send_email = async (email, setEcode) => {
    try {
      const response = await axios.post(`http://${serverIP}:3003/sendEmail`, {
        email: email, // `params` 대신 `data` 사용
      });
      setEcode(response.data.code);
      setEmailCheck(true);
    } catch (error) {
      if (error.response.status === 404) {
        console.log(error.response.data);
      }
      console.log(error);
    }
  };

  const check_code = code => {
    if (code === e_code) {
      setVerify(true);
      setEmailSended(false);
    }
  };

  useEffect(() => {
    if (emailSended === false) return;
    const countdown = setInterval(() => {
      if (parseInt(seconds) > 0) {
        setSeconds(parseInt(seconds) - 1);
      }
      if (parseInt(seconds) === 0) {
        if (parseInt(minutes) === 0) {
          setTimeout(true);
          clearInterval(countdown);
        } else {
          setMinutes(parseInt(minutes) - 1);
          setSeconds(59);
        }
      }
    }, 1000);
    return () => clearInterval(countdown);
  }, [minutes, seconds, emailSended]);

  return (
    <Modal
      isVisible={isSignUp2}
      animationIn={'slideInRight'}
      animationOut={'slideOutLeft'}
      onBackdropPress={() => {
        closeSignUpModal();
        setEmail('');
        setCode('');
        setEmailSended(false);
        setVerify(false);
        setConfirm(false);
        setMinutes(3);
        setSeconds(0);
        setTimeout(false);
        setBirthday('');
      }}>
      <View style={{...styles.modalView, paddingTop: '2%'}}>
        <Text style={{alignSelf: 'center', fontFamily: font.mainFont}}>
          2 / 2
        </Text>
        <View style={[styles.signView, {}]}>
          <Text style={styles.text}>닉네임: </Text>
          <TextInput
            onChangeText={text => setNickName(text)}
            value={nickName}
            style={styles.signUpTextInput}
            placeholder="닉네임을 입력해 주세요"
            autoFocus={true}
          />
        </View>
        <View style={{height: 13, width: '100%'}}>{nickLog}</View>
        <View style={[styles.signView, {marginTop: '2%'}]}>
          <Text style={styles.text}>이메일: </Text>
          <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.signUpTextInput}
              placeholder="이메일을 입력해 주세요"
            />
            {verify ? (
              <View>
                <Text></Text>
              </View>
            ) : (
              <A
                onPress={() => {
                  setMinutes(3);
                  setSeconds(0);
                  setTimeout(false);
                  setEmailSended(true);
                  setCode('');
                  setConfirm(false);
                  send_email(email, setEcode);
                }}
                style={{
                  justifyContent: 'center',
                  // width: timeout ? {} : emailSended ? 0 : {},
                }}>
                <Text style={{fontFamily: font.boldFont, color: '#ffde5c'}}>
                  {emailSended && emailCheck
                    ? timeout
                      ? '재인증'
                      : ''
                    : '인증'}
                </Text>
              </A>
            )}
          </View>
        </View>
        <Text style={{fontSize: 10, color: 'red', alignSelf: 'center'}}>
          {Regex.test(email)
            ? emailSended && !emailCheck
              ? '이미 등록되어 있는 이메일입니다.'
              : null
            : email.length === 0
            ? ''
            : ' 잘못된 이메일 형식입니다.'}
        </Text>
        {emailSended && emailCheck ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              // marginTop: 3,
            }}>
            <Text
              style={{
                fontFamily: font.boldFont,
                color: 'grey',
                marginRight: 5,
                fontSize: 13,
              }}>
              인증코드
            </Text>
            <TextInput
              onChangeText={setCode}
              value={code}
              style={{
                borderWidth: 1,
                borderColor: 'grey',
                width: 70,
                height: 20,
                borderRadius: 2,
                marginRight: 3,
              }}
              placeholder=""
            />
            <Text>
              {'0' + minutes}:{seconds < 10 ? '0' + seconds : seconds}
            </Text>
            <TouchableOpacity
              onPress={() => {
                // setEmailSended(false);
                setConfirm(true);
                if (!timeout) check_code(code);
              }}
              style={{
                // backgroundColor: '#ffde5c',
                justifyContent: 'center',
                // padding: 3,
                // borderRadius: 2,
                marginLeft: 10,
              }}>
              <Text
                style={{
                  fontFamily: font.boldFont,
                  color: '#ffde5c',
                  // marginLeft: 5,
                }}>
                확인
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View></View>
        )}
        {confirm ? (
          verify ? (
            <Text
              style={{
                alignSelf: 'center',
                fontFamily: font.mainFont,
                fontSize: 13,
              }}>
              인증완료
            </Text>
          ) : (
            <View>
              <Text
                style={{
                  fontFamily: font.mainFont,
                  color: 'red',
                  fontSize: 10,
                }}>
                {timeout
                  ? '시간이 초과되었습니다. 재인증 해주세요'
                  : '인증코드가 일치하지 않습니다'}
              </Text>
            </View>
          )
        ) : (
          <View></View>
        )}
        <View style={[styles.signView, {marginTop: '4%'}]}>
          <Text style={styles.text}>생일: </Text>
          <TouchableOpacity
            style={{justifyContent: 'center', paddingHorizontal: 7}}
            onPress={() => setOpenpicker(true)}>
            {birthday != '' ? (
              <Text style={{fontFamily: font.mainFont}}>{birthday}</Text>
            ) : (
              <Text
                style={{
                  fontFamily: font.mainFont,
                }}>
                날짜 선택
              </Text>
            )}
          </TouchableOpacity>
        </View>
        <DatePick
          setBirthday={setBirthday}
          openpicker={openpicker}
          setOpenpicker={setOpenpicker}
        />
        <View style={[styles.signView, {marginTop: 30, alignSelf: 'center'}]}>
          {/* <Text style={styles.text}>테마</Text> */}
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
              }}>
              <TouchableOpacity
                style={{
                  width: colorTheme.color === 'black' ? 40 : 30,
                  height: colorTheme.color === 'black' ? 40 : 30,
                  borderRadius: 50,
                  backgroundColor: '#191919',
                  marginRight: 5,
                }}
                onPress={() =>
                  setThemeColor('black', '#191919', '#5b5b5b')
                }></TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: colorTheme.color === 'green' ? 40 : 30,
                  height: colorTheme.color === 'green' ? 40 : 30,
                  borderRadius: 50,
                  backgroundColor: '#93c47d',
                  marginRight: 5,
                }}
                onPress={() =>
                  setThemeColor('green', '#93c47d', '#d9ead3')
                }></TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: colorTheme.color === 'pink' ? 40 : 30,
                  height: colorTheme.color === 'pink' ? 40 : 30,
                  borderRadius: 50,
                  backgroundColor: '#fccccc',
                  marginRight: 5,
                }}
                onPress={() =>
                  setThemeColor('pink', '#fccccc', '#fce8e8')
                }></TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: colorTheme.color === 'lightblue' ? 40 : 30,
                  height: colorTheme.color === 'lightblue' ? 40 : 30,
                  borderRadius: 50,
                  backgroundColor: '#adc2eb',
                  marginRight: 5,
                }}
                onPress={() =>
                  setThemeColor('lightblue', '#adc2eb', '#d6e0f5')
                }></TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: colorTheme.color === 'orange' ? 40 : 30,
                  height: colorTheme.color === 'orange' ? 40 : 30,
                  borderRadius: 50,
                  backgroundColor: '#f6b26b',
                  marginRight: 5,
                }}
                onPress={() =>
                  setThemeColor('orange', '#f6b26b', '#ffe6b7')
                }></TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: colorTheme.color === 'purple' ? 40 : 30,
                  height: colorTheme.color === 'purple' ? 40 : 30,
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
        <VibrationComponent ref={vibrationRef} style={{alignSelf: 'flex-end'}}>
          <TouchableOpacity
            style={{
              padding: 20,
              left: 15,
            }}
            onPress={() => register()}>
            <Text style={{fontFamily: font.boldFont}}>다음</Text>
            {/* <Image
              source={require('../image/next_button.png')}
              style={{width: 44, height: 44, bottom: '5%'}}
              resizeMode={'contain'}
            /> */}
          </TouchableOpacity>
        </VibrationComponent>
      </View>
    </Modal>
  );
}

function SignIn({vibrationRef, join_success}) {
  const [id, setID] = useState('');
  const [pw, setPW] = useState('');
  const [idFocus, setIdFocus] = useState(false);
  const [pwFocus, setPwFocus] = useState(false);
  const [alert, setAlert] = useState(false);

  const login = async () => {
    try {
      const res = await fetch(`http://${serverIP}:3003/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: id,
          pw: pw,
        }),
      });
      if (res.status === 200) {
        const data = await res.json();
        join_success(id, data.token);
      }
      if (res.status === 404 || res.status === 401) {
        setAlert(true);
      }
      // if (res.status === 401) {
      //   console.log('incorrect password');
      // }
    } catch (error) {
      console.log(`SignIn ERROR: `, error);
    }
  };
  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <View style={{...styles.signView, flexDirection: 'column'}}>
        <Text
          style={{...styles.text, alignSelf: 'flex-start', marginBottom: 10}}>
          아이디{' '}
        </Text>
        <TextInput
          onFocus={() => setIdFocus(true)}
          onBlur={() => setIdFocus(false)}
          value={id}
          onChangeText={text => setID(text)}
          maxLength={20}
          placeholder="아이디를 입력해 주세요"
          style={[
            styles.textInput,
            idFocus ? {backgroundColor: '#F9F9F9'} : null,
          ]}
        />
      </View>
      <View
        style={{...styles.signView, marginTop: 20, flexDirection: 'column'}}>
        <Text
          style={{...styles.text, alignSelf: 'flex-start', marginBottom: 10}}>
          비밀번호{' '}
        </Text>
        <TextInput
          onFocus={() => setPwFocus(true)}
          onBlur={() => setPwFocus(false)}
          value={pw}
          maxLength={20}
          onChangeText={text => setPW(text)}
          placeholder="비밀번호를 입력해 주세요"
          style={[
            styles.textInput,
            pwFocus ? {backgroundColor: '#F9F9F9'} : null,
          ]}
          secureTextEntry={true}
        />
      </View>
      <CustomAlert
        visible={alert}
        title={'아이디 또는 비밀번호가 \n일치하지 않습니다'}
        message={''}
        onClose={() => {
          setAlert(false);
        }}
        onCloseButtonText={'닫기'}
      />
      <VibrationComponent ref={vibrationRef} style={{}}>
        <TouchableOpacity
          style={{
            marginTop: '10%',
            width: windowWidth - 70,
            height: Platform.OS === 'ios' ? 36.4 : 40.6,
            backgroundColor: '#ffde5c',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 10,
            marginBottom: 7,
          }}
          onPress={() => login()}>
          <Text style={{color: 'white', fontFamily: font.boldFont}}>
            로그인
          </Text>
        </TouchableOpacity>
      </VibrationComponent>
    </View>
  );
}

function NewPwModal({
  newPwModal,
  setNewPwModal,
  pw,
  pw2,
  setPw,
  setPw2,
  pwLog,
  pwStatus,
  email,
}) {
  const updatePasswordRequest = async () => {
    if (!pwStatus) return;

    try {
      const res = await axios.put(`http://${serverIP}:3003/modifyPassword`, {
        pw: pw,
        email: email,
      });

      if (res.status === 200) {
        setPw('');
        setPw2('');
        setNewPwModal(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      isVisible={newPwModal}
      animationIn={'slideInRight'}
      animationOut={'slideOutLeft'}
      onBackdropPress={() => {
        setPw('');
        setPw2('');
        setNewPwModal(false);
      }}>
      <View
        style={{
          ...styles.modalView,
          paddingHorizontal: '3%',
          height: 200,
          alignItems: 'center',
          justifyContent: 'space-around',
        }}>
        <Text
          style={{
            fontSize: 12,
            marginBottom: 10,
            textAlign: 'center',
            fontFamily: font.mainFont,
          }}>
          새로 설정할 비밀번호를 입력하세요
        </Text>
        <View>
          <View
            style={{
              flexDirection: 'row',
              display: 'flex',
              alignItems: 'center',
            }}>
            <Text style={{fontFamily: font.mainFont}}>비밀번호:</Text>
            <TextInput
              secureTextEntry={true}
              onChangeText={setPw}
              value={pw}
              style={{
                ...styles.signUpTextInput,
                fontSize: 13,
                fontFamily: font.mainFont,
              }}
              placeholder="비밀번호를 입력하세요"></TextInput>
          </View>
          <View
            style={{
              flexDirection: 'row',
              marginTop: 7,
              display: 'flex',
              alignItems: 'center',
            }}>
            <Text style={{fontFamily: font.mainFont}}>비밀번호 확인:</Text>
            <TextInput
              secureTextEntry={true}
              onChangeText={setPw2}
              value={pw2}
              style={{
                ...styles.signUpTextInput,
                fontSize: 13,
                fontFamily: font.mainFont,
              }}
              placeholder="비밀번호를 입력하세요"></TextInput>
          </View>
        </View>
        {pw.length ? (
          <View style={{height: 13, width: '100%'}}>{pwLog}</View>
        ) : (
          <Text
            style={{
              fontSize: 13,
              fontFamily: font.mainFont,
              color: 'red',
            }}>
            비밀번호는 특수문자, 영문자, 숫자를 포함한 8~20자리여야 합니다.
          </Text>
        )}
        <TouchableOpacity onPress={() => updatePasswordRequest()}>
          <Text
            style={{
              fontFamily: font.boldFont,
              color: '#ffde5c',
              padding: 20,
            }}>
            완료
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

function FindPwModal({
  findPwModal,
  setFindPwModal,
  verify,
  setVerify,
  setNewPwModal,
  email,
  setEmail,
}) {
  const [emailSended, setEmailSended] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [code, setCode] = useState('');
  const [e_code, setEcode] = useState('');
  const [minutes, setMinutes] = useState(3);
  const [seconds, setSeconds] = useState(0);
  const [timeOut, setTimeOut] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const Regex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
  const ChangeableView = Regex.test(email) ? TouchableOpacity : View;
  const check_code = code => {
    if (code === e_code) {
      setVerify(true);
      setEmailSended(false);
    }
  };

  const send_PwEmail = async (email, setEcode) => {
    try {
      const response = await axios.post(`http://${serverIP}:3003/sendPwEmail`, {
        email: email, // `params` 대신 `data` 사용
      });
      // console.log(response.data);
      setEcode(response.data.code);
      setCheckEmail(true);
    } catch (error) {
      if (error.response.status === 404) {
        setCheckEmail(false);
        console.log(error.response.data);
        // console.error('요청 실패: ', error.response.data);
        // 에러 처리 또는 사용자에게 표시할 메시지를 여기서 정의할 수 있습니다.
      }
    }
  };

  const openNewPwModal = () => {
    setFindPwModal(false);
    setTimeout(() => {
      setNewPwModal(true);
    }, 600); // 1000ms = 1 second
  };

  useEffect(() => {
    if (emailSended === false) return;
    const countdown = setInterval(() => {
      if (parseInt(seconds) > 0) {
        setSeconds(parseInt(seconds) - 1);
      }
      if (parseInt(seconds) === 0) {
        if (parseInt(minutes) === 0) {
          setTimeOut(true);
          clearInterval(countdown);
        } else {
          setMinutes(parseInt(minutes) - 1);
          setSeconds(59);
        }
      }
    }, 1000);
    return () => clearInterval(countdown);
  }, [minutes, seconds, emailSended]);
  return (
    <Modal
      isVisible={findPwModal}
      animationIn={'slideInRight'}
      animationOut={'slideOutLeft'}
      onBackdropPress={() => {
        setFindPwModal(false);
        setEmail('');
        setCode('');
        setEmailSended(false);
        setVerify(false);
        setConfirm(false);
        setMinutes(3);
        setSeconds(0);
        setTimeOut(false);
      }}>
      <View
        style={{
          ...styles.modalView,
          paddingHorizontal: '3%',
          height: 200,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          style={{
            fontSize: 12,
            marginBottom: 10,
            textAlign: 'center',
            fontFamily: font.mainFont,
          }}>
          계정에 등록된 이메일을 입력하시면 인증번호를 보내드립니다
        </Text>
        <View style={[styles.signView, {marginTop: '2%'}]}>
          <Text style={styles.text}>이메일: </Text>
          <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.signUpTextInput}
              placeholder="이메일을 입력해 주세요"
            />
            {verify ? (
              <View>
                <Text></Text>
              </View>
            ) : (
              <ChangeableView
                onPress={() => {
                  send_PwEmail(email, setEcode);
                  setEmailSended(true);
                  setMinutes(0);
                  setSeconds(5);
                  setTimeOut(false);
                  setCode('');
                  setConfirm(false);
                }}
                style={{
                  justifyContent: 'center',
                }}>
                <Text style={{fontFamily: font.boldFont, color: '#ffde5c'}}>
                  {emailSended && checkEmail
                    ? timeOut
                      ? '재인증'
                      : ''
                    : '인증'}
                </Text>
              </ChangeableView>
            )}
          </View>
        </View>
        <Text style={{fontSize: 11, color: 'red'}}>
          {Regex.test(email)
            ? emailSended && !checkEmail
              ? '계정에 등록되지 않은 이메일입니다.'
              : null
            : email.length === 0
            ? ''
            : ' 잘못된 이메일 형식입니다.'}
        </Text>
        {emailSended && checkEmail ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              // marginTop: 3,
            }}>
            <Text
              style={{
                fontFamily: font.boldFont,
                color: 'grey',
                marginRight: 5,
                fontSize: 13,
              }}>
              인증코드
            </Text>
            <TextInput
              onChangeText={setCode}
              value={code}
              style={{
                fontFamily: font.boldFont,
                borderWidth: 1,
                borderColor: 'grey',
                borderRadius: 2,
                width: 70,
                height: 20,
                padding: 0,
                marginRight: 3,
                margin: 0,
              }}
              placeholder=""
            />
            <Text>
              {'0' + minutes}:{seconds < 10 ? '0' + seconds : seconds}
            </Text>
            <TouchableOpacity
              onPress={() => {
                // setEmailSended(false);
                setConfirm(true);
                if (!timeOut) check_code(code);
              }}
              style={{
                // backgroundColor: '#ffde5c',
                justifyContent: 'center',
                // padding: 3,
                // borderRadius: 2,
                marginLeft: 10,
              }}>
              <Text
                style={{
                  fontFamily: font.boldFont,
                  color: '#ffde5c',
                  // marginLeft: 5,
                }}>
                확인
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View></View>
        )}
        {confirm ? (
          verify ? (
            <TouchableOpacity
              onPress={() => {
                setCode('');
                setEmailSended(false);
                setVerify(false);
                setConfirm(false);
                setMinutes(3);
                setSeconds(0);
                setTimeOut(false);
                openNewPwModal();
              }}>
              <Text
                style={{
                  alignSelf: 'center',
                  fontFamily: font.boldFont,
                  fontSize: 14,
                  color: '#ffde5c',
                }}>
                비밀번호 새로 설정하기
              </Text>
            </TouchableOpacity>
          ) : (
            <Text
              style={{
                fontFamily: font.mainFont,
                color: 'red',
                fontSize: 11,
                padding: 10,
              }}>
              {timeOut
                ? '시간이 초과되었습니다. 재인증 해주세요'
                : '인증코드가 일치하지 않습니다'}
            </Text>
          )
        ) : (
          <Text></Text>
        )}
      </View>
    </Modal>
  );
}

function FindIdModal({findIdModal, setFindIdModal}) {
  const [email, setEmail] = useState('');
  const [sendMail, setSendMail] = useState(false);
  const Regex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
  const A = Regex.test(email) ? TouchableOpacity : View;
  const [message, setMessage] = useState('');
  const sendIdMail = async () => {
    try {
      const response = await axios.post(`http://${serverIP}:3003/sendIdMail`, {
        email: email, // `params` 대신 `data` 사용
      });
      setMessage('메일이 전송되었습니다.');
    } catch (error) {
      if (error.response.status === 404) {
        setMessage('계정에 등록되지 않은 이메일입니다.');
        // console.error('요청 실패: ', error.response.data);
        // 에러 처리 또는 사용자에게 표시할 메시지를 여기서 정의할 수 있습니다.
      } else {
        // 네트워크 오류 또는 예기치 않은 오류의 경우
        // console.error('오류: ', error.message);
      }
    }
  };
  return (
    <Modal
      isVisible={findIdModal}
      animationIn={'slideInRight'}
      animationOut={'slideOutLeft'}
      onBackdropPress={() => {
        setEmail('');
        setSendMail(false);
        setFindIdModal(false);
      }}>
      <View
        style={{
          ...styles.modalView,
          paddingHorizontal: '3%',
          height: 200,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          style={{
            fontSize: 12,
            marginBottom: 10,
            textAlign: 'center',
            fontFamily: font.mainFont,
          }}>
          계정에 등록된 이메일이면 해당 계정 아이디를 {`\n`}이메일로
          보내드립니다
        </Text>
        <View style={{flexDirection: 'row'}}>
          <TextInput
            onChangeText={setEmail}
            value={email}
            style={{
              ...styles.signUpTextInput,
              fontSize: 13,
              fontFamily: font.mainFont,
            }}
            placeholder="이메일을 입력하세요"></TextInput>
          <A
            onPress={() => {
              setSendMail(true);
              sendIdMail();
            }}
            style={{
              justifyContent: 'center',
              padding: 10,
            }}>
            <Text
              style={{
                fontSize: 13,
                fontFamily: font.boldFont,
                color: '#ffde5c',
              }}>
              {sendMail ? '재전송' : '전송'}
            </Text>
          </A>
        </View>
        {sendMail ? (
          <Text
            style={{
              fontSize: 12,
              fontFamily: font.mainFont,
            }}>
            {message}
          </Text>
        ) : Regex.test(email) ? (
          []
        ) : email !== '' ? (
          <Text
            style={{
              fontSize: 12,
              fontFamily: font.mainFont,
            }}>
            이메일 형식이 올바르지 않습니다.
          </Text>
        ) : (
          []
        )}
      </View>
    </Modal>
  );
}

function Find_id_pw({
  findModal,
  setFindModal,
  findIdModal,
  setFindIdModal,
  findPwModal,
  setFindPwModal,
}) {
  const openFindIdModal = () => {
    setFindModal(false);
    setTimeout(() => {
      setFindIdModal(true);
    }, 600); // 1000ms = 1 second
  };

  const openFindPwModal = () => {
    setFindModal(false);
    setTimeout(() => {
      setFindPwModal(true);
    }, 600); // 1000ms = 1 second
  };

  return (
    <Modal
      isVisible={findModal}
      animationIn={'slideInRight'}
      animationOut={'slideOutLeft'}
      onBackdropPress={() => setFindModal(false)}>
      <View
        style={{
          ...styles.modalView,
          paddingHorizontal: '3%',
          height: 200,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
        }}>
        <TouchableOpacity
          style={{
            width: '45%',
            height: '60%',
            // borderWidth: 1,
            backgroundColor: '#ffde5c',
            justifyContent: 'center',
            borderRadius: 10,
            padding: 6,
          }}
          onPress={() => openFindIdModal()}>
          <Text
            style={{
              color: 'white',
              textAlign: 'center',
              // marginBottom: 10,
              fontFamily: font.boldFont,
            }}>
            아이디 찾기{`\n`}ID
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: '45%',
            height: '60%',
            backgroundColor: '#ffde5c',
            borderRadius: 10,
            padding: 6,
            justifyContent: 'center',
          }}
          onPress={() => openFindPwModal()}>
          <Text
            style={{
              textAlign: 'center',
              fontFamily: font.boldFont,
              color: 'white',
            }}>
            비밀번호 찾기{`\n`}PW
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
export default function Addinfo({navigation}) {
  const [id, setID] = useState('');
  const [pw, setPW] = useState('');
  const [pw2, setPW2] = useState('');
  const [nickName, setNickName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [openpicker, setOpenpicker] = useState(false);
  // const [selectedDate, setSelectedDate] = useState(new Date());
  const [isSignUp2, setIsSignUp2] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [findModal, setFindModal] = useState(false);
  const [idLog, setIdLog] = useState('');
  const [pwLog, setPwLog] = useState('');
  const [nickLog, setNickLog] = useState('');
  const [idStatus, setIDStatus] = useState(false);
  const [pwStatus, setPWStatus] = useState(false);
  const [nickNameStatus, setNickNameStatus] = useState(false);
  const vibrationRef = useRef(null);
  const {user, setUser} = useContext(ThemeContext);
  const {colorTheme, setColorTheme} = useContext(ThemeContext);
  const {nick, setNick} = useContext(ThemeContext);
  const {birth, setBirth} = useContext(ThemeContext);
  const [isLodaing, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [verify, setVerify] = useState(false);
  const [findIdModal, setFindIdModal] = useState(false);
  const [findPwModal, setFindPwModal] = useState(false);
  const [newPwModal, setNewPwModal] = useState(false);

  useEffect(() => {
    idCheck();
  }, [id]);

  useEffect(() => {
    pwCheck();
  }, [pw, pw2]);

  useEffect(() => {
    nickCheck();
  }, [nickName]);

  const join_success = async (id, data) => {
    if (user) {
      try {
        const response = await axios.get(`http://${serverIP}:3003/userData`, {
          params: {
            user: id,
          },
        });
        await AsyncStorage.setItem('jwtToken', data);
        await AsyncStorage.setItem(
          'userData',
          JSON.stringify({
            nickname: response.data[0].nickName,
            birthday: response.data[0].birthday.substring(0, 10),
            id: id,
          }),
        );
        setUser(id);
        setNick(response.data[0].nickName);
        setBirth(response.data[0].birthday.substring(0, 10));
        //  setNick(nickName);
        navigation.replace('MainPage');
      } catch (error) {
        console.log(error);
      }
    }
  };

  const pwCheck = () => {
    const passwordRegEx =
      /^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z0-9!@#$%^&*(),.?":{}|<>]{8,20}$/;

    setPWStatus(false);
    if (pw === '' || pw2 === '') return setPwLog(<Text></Text>);
    else if (!passwordRegEx.test(pw))
      return setPwLog(
        <Text style={[styles.logText, {color: 'black'}]}>
          비밀번호는 특수문자, 영문자, 숫자를 포함한 8~20자리여야 합니다.
        </Text>,
      );
    else if (pw === pw2) {
      setPWStatus(true);
      return setPwLog(
        <Text style={[styles.logText, {color: 'black'}]}>
          비밀번호가 일치합니다
        </Text>,
      );
    } else if (pw !== '' && pw2 !== '' && pw !== pw2) {
      return setPwLog(
        <Text style={styles.logText}>비밀번호가 일치하지 않습니다</Text>,
      );
    }
  };

  const idCheck = async () => {
    const regex = /^[A-Za-z0-9]{4,20}$/;

    setIDStatus(false);
    if (id === '') return setIdLog(<Text></Text>);
    else if (!regex.test(id))
      return setIdLog(
        <Text style={[styles.logText, {color: 'black'}]}>
          아이디는 4글자 이상, 20글자 이하, 영문자, 숫자만 가능합니다.
        </Text>,
      );
    try {
      const res = await fetch(
        `http://${serverIP}:3003/idDuplicateCheck?id=` + id,
      );
      const a = await res.json();
      if (a && a.length > 0 && a[0].id) {
        setIdLog(<Text style={styles.logText}>사용 불가한 아이디입니다.</Text>);
      } else {
        setIDStatus(true);
        setIdLog(
          <Text style={[styles.logText, {color: 'black'}]}>
            사용 가능한 아이디입니다.
          </Text>,
        );
      }
    } catch (error) {
      console.error('Error occurred:', error);
    }
  };

  const nickCheck = () => {
    const regex = /^[A-Za-z\uAC00-\uD7A3]{2,10}$/;

    setNickNameStatus(false);
    if (nickName === '') return setNickLog(<Text></Text>);
    else if (!regex.test(nickName))
      return setNickLog(
        <Text style={[styles.logText, {color: 'black'}]}>
          한글, 영문자 포함 2~10 글자만 가능합니다.
        </Text>,
      );
    else {
      setNickNameStatus(true);
      return setNickLog(
        <Text style={[styles.logText, {color: 'black'}]}>
          사용 가능한 닉네임입니다.
        </Text>,
      );
    }
  };

  const nextSignUp = () => {
    if (!idStatus || !pwStatus) return triggerVibration(); //아이디, 비밀번호가 유효하지 않으면 안 넘어감

    setIsSignUp(false);

    setTimeout(() => {
      setIsSignUp2(true);
    }, 600); // 1000ms = 1 second
  };

  const triggerVibration = () => {
    vibrationRef.current.startVibration();
  };

  const closeSignUpModal = () => {
    setID('');
    setPW('');
    setPW2('');
    setNickName('');
    setIsSignUp(false);
    setIsSignUp2(false);
  };

  const register = async () => {
    if (nickNameStatus === false || verify === false || birthday === '')
      return triggerVibration();
    try {
      const res = await fetch(`http://${serverIP}:3003/signUp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: id,
          pw: pw,
          nickName: nickName,
          birthday: birthday,
          email: email,
        }),
      });
      if (!res.ok) {
        const errorMessage = await res.text(); // 만약 응답이 JSON 형태라면, res.json()을 사용
        throw new Error(errorMessage); // 추출한 에러 메시지를 throw
      }
      setIsSignUp2(false);
      closeSignUpModal();
    } catch (error) {
      console.log(`register ERROR: `, error);
    }
  };
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
    <Pressable onPress={Keyboard.dismiss} style={styles.container}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          position: 'relative',
          // backgroundColor: 'white',
        }}>
        <FastImage
          source={require('../image/mory.png')}
          style={{
            aspectRatio: 1,
            width: 100,
            position: 'absolute',
            alignSelf: 'center',
            top: '15%',
          }}
          resizeMode="contain"
        />
        <View style={{marginBottom: '10%'}}>
          <SignIn join_success={join_success} />
          <TouchableOpacity
            style={{
              width: windowWidth - 70,
              height: Platform.OS === 'ios' ? 36.4 : 40.6,
              backgroundColor: '#ffde5c',
              justifyContent: 'center',
              alignSelf: 'center',
              alignItems: 'center',
              borderRadius: 10,
            }}
            onPress={() => setIsSignUp(true)}>
            <Text style={{color: 'white', fontFamily: font.boldFont}}>
              회원가입
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: windowWidth - 70,
              height: Platform.OS === 'ios' ? 36.4 : 40.6,
              backgroundColor: '#ffde5c',
              justifyContent: 'center',
              alignSelf: 'center',
              alignItems: 'center',
              marginTop: 7,
              borderRadius: 10,
            }}
            onPress={() => {
              setFindModal(true);
            }}>
            <Text style={{color: 'white', fontFamily: font.boldFont}}>
              아이디 / 비밀번호 찾기
            </Text>
          </TouchableOpacity>
        </View>
        <SignUpStep1
          isSignUp={isSignUp}
          closeSignUpModal={closeSignUpModal}
          id={id}
          pw={pw}
          pw2={pw2}
          setID={setID}
          setPW={setPW}
          setPW2={setPW2}
          vibrationRef={vibrationRef}
          nextSignUp={nextSignUp}
          idLog={idLog}
          pwLog={pwLog}
        />
        <SignUpStep2
          isSignUp2={isSignUp2}
          closeSignUpModal={closeSignUpModal}
          nickName={nickName}
          setNickName={setNickName}
          nickLog={nickLog}
          setBirthday={setBirthday}
          openpicker={openpicker}
          setOpenpicker={setOpenpicker}
          birthday={birthday}
          register={register}
          vibrationRef={vibrationRef}
          colorTheme={colorTheme}
          isLodaing={isLodaing}
          setThemeColor={setThemeColor}
          email={email}
          setEmail={setEmail}
          verify={verify}
          setVerify={setVerify}
        />
        <Find_id_pw
          findModal={findModal}
          setFindModal={setFindModal}
          setFindIdModal={setFindIdModal}
          findIdModal={findIdModal}
          findPwModal={findPwModal}
          setFindPwModal={setFindPwModal}
        />
        <FindIdModal
          findIdModal={findIdModal}
          setFindIdModal={setFindIdModal}
        />
        <FindPwModal
          findPwModal={findPwModal}
          setFindPwModal={setFindPwModal}
          verify={verify}
          setVerify={setVerify}
          setNewPwModal={setNewPwModal}
          email={email}
          setEmail={setEmail}
        />
        <NewPwModal
          newPwModal={newPwModal}
          pw={pw}
          pw2={pw2}
          setPw={setPW}
          setPw2={setPW2}
          pwLog={pwLog}
          pwStatus={pwStatus}
          setNewPwModal={setNewPwModal}
          email={email}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  textInput: {
    fontSize: 15,
    borderWidth: 0.3,
    borderColor: 'lightgrey',
    borderRadius: 10,
    paddingHorizontal: 10,
    ...Platform.select({
      ios: {
        paddingVertical: 10,
      },
      android: {
        paddingVertical: 6,
      },
    }),
    width: windowWidth - 70,
    fontFamily: font.mainFont,
    fontSize: 13,
  },
  signUpTextInput: {
    fontSize: 15,
    width: 170,
    fontFamily: font.mainFont,
    paddingHorizontal: 7,
    // backgroundColor: 'pink',
    paddingVertical: Platform.OS === 'android' ? 1 : 0,
  },
  text: {
    fontSize: 15,
    // marginBottom: 7,
    alignSelf: 'center',
    textAlign: 'center',
    fontFamily: font.boldFont,
    color: 'black',
  },
  logText: {
    flex: 1,
    fontSize: 10,
    fontFamily: font.mainFont,
    color: 'red',
    textAlign: 'center',
    marginRight: '3%',
    bottom: Platform.OS === 'ios' ? 0 : '50%',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'flex-start',
    alignSelf: 'center',
    marginBottom: 20,
    width: windowWidth * 0.82,
    paddingHorizontal: '10%',
  },
  signView: {
    marginTop: '8%',
    flexDirection: 'row',
  },
});
