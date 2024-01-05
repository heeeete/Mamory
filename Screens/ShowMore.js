import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Alert,
  TextInput,
} from 'react-native';
import font from '../Styles/font';
import {ScrollView} from 'react-native-gesture-handler';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Entypo from 'react-native-vector-icons/Entypo';
import ReadMore from 'react-native-read-more-text';
import {SafeAreaView} from 'react-native-safe-area-context';
import axios from 'axios';
import {useContext, useState} from 'react';
import color from '../Styles/color';
import FastImage from 'react-native-fast-image';
import {transform} from 'lodash';
import {ThemeContext} from './Context/ThemeContext';
import CustomAlert from './component/CustomAlert';
import Octicons from 'react-native-vector-icons/Octicons';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const S3Config = require('../config/awsS3Config.json');
const serverIP = '43.200.88.208';
const screenHeight = Dimensions.get('window').height;
const s3 = new AWS.S3({
  accessKeyId: S3Config.AccesskeyID,
  secretAccessKey: S3Config.Secretaccesskey,
  region: S3Config.region,
});

function RenderHeader({
  item,
  navigation,
  isModify,
  setIsModify,
  rate,
  text,
  setRate,
  setText,
  setOpenAlert,
}) {
  const {getRememberBook} = useContext(ThemeContext);

  const onClickCancell = () => {
    setRate(item.rate);
    setText(item.review);
    setIsModify(false);
  };

  const onClickSave = async setIsModify => {
    await axios
      .put(`http://${serverIP}:3003/rememberbookModify`, {
        rate: rate,
        review: text,
        idx: item.idx,
      })
      .then(response => {
        console.log(response.data);
        getRememberBook(item.category);
        setIsModify(false);
      })
      .catch(error => {
        console.error('Axios Modify error!', error);
      });
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: '3%',
        marginBottom: '4%',
      }}>
      {isModify ? (
        <TouchableOpacity onPress={() => onClickCancell()}>
          <Text style={[styles.headersFont, {color: 'red'}]}>취소</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => setIsModify(true)}>
          <Text style={styles.headersFont}>수정</Text>
        </TouchableOpacity>
      )}
      {isModify ? (
        <TouchableOpacity onPress={() => onClickSave(setIsModify)}>
          <Text style={styles.headersFont}>저장</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => {
            setOpenAlert(true);
          }}>
          <Text style={[styles.headersFont, {color: 'red'}]}>삭제</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function RenderPoster({item}) {
  return (
    <View style={styles.posterBox}>
      <FastImage
        source={
          item.img_url ? {uri: item.img_url} : require('../image/noimg4.png')
        }
        style={[
          styles.poster,
          {
            transform: [{scale: item.img_url ? 0.9 : 0.5}],
          },
        ]}
        resizeMode="stretch"
      />
    </View>
  );
}

function RenderRate({rate, setRate, isModify, colorTheme}) {
  const Wrapper = isModify ? TouchableOpacity : View;
  const disLikeColor = rate === 'dislike' ? 'white' : null;
  const likeColor = rate === 'like' ? 'white' : null;

  const onChangeRate = rate => {
    setRate(rate);
  };

  if (isModify) {
    return (
      <View style={styles.modifyView}>
        <TouchableOpacity
          style={[
            styles.modifyTouchable,
            rate === 'like' && {transform: [{scale: 1.1}]},
            // {marginRight: '3%'},
          ]}
          onPress={() => onChangeRate('like')}>
          <Octicons name={'thumbsup'} color={colorTheme.hexCode} size={17} />
          <Text
            style={{
              fontSize: 15,
              fontFamily: font.boldFont,
            }}>
            재밌어요
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modifyTouchable,
            rate === 'dislike' && {transform: [{scale: 1.1}]},
          ]}
          onPress={() => onChangeRate('dislike')}>
          <Octicons
            name={'thumbsdown'}
            color={colorTheme.hexCode}
            size={17}
            style={{marginTop: 2}}
          />
          <Text
            style={{
              fontSize: 15,
              fontFamily: font.boldFont,
            }}>
            별로에요
          </Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '5%',
        }}>
        <Octicons
          name={rate === 'like' ? 'thumbsup' : 'thumbsdown'}
          color={colorTheme.hexCode}
          size={17}
        />
        <Text
          style={{
            marginLeft: 3,
            fontSize: 15,
            fontFamily: font.boldFont,
          }}>
          {rate === 'like' ? '재밌어요' : '별로에요'}
        </Text>
      </View>
    );
  }
}

function RenderCreater({item}) {
  return (
    <Text style={{fontFamily: font.mainFont, fontSize: 15}}>
      {item.category === 'Movie' ? '감독: ' : `저자: `}
      <Text style={{fontFamily: font.mainFont, fontSize: 15}}>
        {item.creater}
      </Text>
    </Text>
  );
}

function RenderActors({item}) {
  if (item.category === 'Movie') {
    return (
      <Text style={{fontFamily: font.mainFont, fontSize: 15}}>
        출연:{' '}
        <Text style={{fontFamily: font.mainFont, fontSize: 15}}>
          {item.actors}
        </Text>
      </Text>
    );
  }
}

function RenderReview({item, isModify, onChangeText, text}) {
  if (item.review) {
    return (
      <View style={{paddingVertical: '7%'}}>
        <View
          style={{
            paddingVertical: '4%',
          }}>
          {isModify ? (
            <TextInput
              value={text}
              onChangeText={text => onChangeText(text)}
              multiline={true}
              style={{
                fontFamily: font.mainFont,
                maxHeight: screenHeight * 0.2,
                marginTop: -15,
                marginBottom: -15,
                padding: 5,
                borderWidth: 1,
                borderRadius: 4,
                borderColor: 'lightgrey',
              }}></TextInput>
          ) : (
            <View>
              <View style={styles.dashedLine}></View>
              <ScrollView
                style={{
                  maxHeight: screenHeight * 0.2 - 10,
                  marginTop: 7,
                }}
                contentContainerStyle={{
                  paddingBottom: '3%',
                  paddingRight: '4%',
                }}>
                <Text
                  style={{
                    fontFamily: font.mainFont,
                  }}>
                  {text}
                </Text>
              </ScrollView>
              <View style={styles.dashedLine}></View>
            </View>
          )}
        </View>
      </View>
    );
  }
}

function RenderPlot({item}) {
  const {colorTheme} = useContext(ThemeContext);
  const _renderTruncatedFooter = handlePress => {
    return (
      <Text
        style={{
          color:
            colorTheme.color === 'black' ? 'lightgrey' : colorTheme.hexCode,
        }}
        onPress={handlePress}>
        더보기
      </Text>
    );
  };

  const _renderRevealedFooter = handlePress => {
    return (
      <Text
        style={{
          color:
            colorTheme.color === 'black' ? 'lightgrey' : colorTheme.hexCode,
        }}
        onPress={handlePress}>
        숨기기
      </Text>
    );
  };

  return (
    <View style={{paddingHorizontal: '15%', marginTop: !item.review && '7%'}}>
      <ReadMore
        numberOfLines={3}
        renderTruncatedFooter={_renderTruncatedFooter}
        renderRevealedFooter={_renderRevealedFooter}>
        <Text style={{fontFamily: font.mainFont}}>{item.plot}</Text>
      </ReadMore>
    </View>
  );
}

function ShowMore({route, navigation}) {
  const {item} = route.params;
  const [isModify, setIsModify] = useState(false);
  const [text, setText] = useState(item.review);
  const [rate, setRate] = useState(item.rate);
  const [openAlert, setOpenAlert] = useState(false);
  const {colorTheme, getRememberBook} = useContext(ThemeContext);

  const onChangeText = text => {
    setText(text);
  };

  const axiosRequestDelete = async () => {
    await axios
      .delete(`http://${serverIP}:3003/deleteItem`, {
        data: {idx: item.idx},
      })
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.error('Axios Delete error!', error);
      });
  };

  const deleteItem = async () => {
    if (item.img_url && item.img_url.includes('amazonaws')) {
      const key = item.img_url.split('/').pop(); // 이미지 URL에서 키 추출
      const params = {
        Bucket: S3Config.bucket,
        Key: key, // 이미지 키
      };

      s3.deleteObject(params, (err, data) => {
        if (err) {
          console.log('이미지 삭제 실패:', err);
        } else {
          console.log('이미지 삭제 성공:', data);
        }
      });
      await axiosRequestDelete();
      getRememberBook(item.category);
      navigation.goBack();
    } else {
      await axiosRequestDelete();
      getRememberBook(item.category);
      navigation.goBack();
    }
  };
  return (
    <SafeAreaView edges={['top']}>
      <KeyboardAwareScrollView keyboardShouldPersistTaps="handled">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{paddingBottom: '10%'}}>
          <View style={{paddingHorizontal: '3%'}}>
            <RenderHeader
              item={item}
              navigation={navigation}
              isModify={isModify}
              setIsModify={setIsModify}
              rate={rate}
              text={text}
              setRate={setRate}
              setText={setText}
              setOpenAlert={setOpenAlert}
            />
            <CustomAlert
              visible={openAlert}
              title={'삭제 하시겠습니까?'}
              message={''}
              onClose={() => {
                setOpenAlert(false);
              }}
              onCloseButtonText={'취소'}
              onConfirmButtonText={'확인'}
              onConfirm={() => deleteItem()}
            />
            <View
              style={{
                paddingHorizontal: 5,
                borderColor: 'lightgrey',
                borderRadius: 8,
                marginTop: '2%',
              }}>
              <Text style={styles.title}>{item.title}</Text>
              <RenderPoster item={item} />
              <RenderRate
                item={item}
                isModify={isModify}
                rate={rate}
                setRate={setRate}
                colorTheme={colorTheme}
              />
              <View style={{paddingHorizontal: '13%'}}>
                <RenderCreater item={item} />
                <RenderActors item={item} />
                <RenderReview
                  item={item}
                  isModify={isModify}
                  onChangeText={onChangeText}
                  text={text}
                />
              </View>
            </View>
          </View>
          <RenderPlot item={item} />
        </ScrollView>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    fontFamily: font.boldFont,
    fontSize: 19,
    paddingHorizontal: '12%',
    paddingTop: '5%',
    marginBottom: '5%',
    opacity: 0.8,
  },
  posterBox: {
    aspectRatio: 0.68,
    width: '60%',
    alignSelf: 'center',
    marginBottom: '5%',
  },
  poster: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  rateBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: 40,
    marginBottom: '5%',
  },
  rate: {
    width: '25%',
    marginRight: '2%',
    borderRadius: 100,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  dashedLine: {
    borderWidth: 1,
    borderStyle: 'dotted',
    borderColor: 'lightgrey',
  },
  headersFont: {
    fontFamily: font.mainFont,
    fontSize: 17,
  },
  modifyView: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: '3%',
    height: 40,
  },
  modifyTouchable: {
    width: '30%',
    borderRadius: 100,
    flexDirection: 'row',
    paddingHorizontal: '3%',
    justifyContent: 'space-around',
    // alignItems: 'center',
  },
});

export default ShowMore;
