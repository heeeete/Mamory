import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Modal,
  Dimensions,
  StyleSheet,
  Linking,
  TextInput,
} from 'react-native';
import {useState, useRef, useContext} from 'react';
//------------------icon-----------------------
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import Entypo from 'react-native-vector-icons/Entypo';
//------------------icon-----------------------
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import {ActivityIndicator} from 'react-native-paper';
import axios from 'axios';
import {launchImageLibrary} from 'react-native-image-picker';
import AWS, {Firehose} from 'aws-sdk';
import RNFS from 'react-native-fs';
import {Buffer} from 'buffer';
import font from '../Styles/font';
import ReadMore from 'react-native-read-more-text';
import VibrationComponent from './component/VibrationComponent';
import MyTextinput from './component/MyTextinput';
import FastImage from 'react-native-fast-image';
import {ThemeContext} from './Context/ThemeContext';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {tr} from 'date-fns/locale';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const S3Config = require('../config/awsS3Config.json');
const serverIP = '43.200.88.208';

const s3 = new AWS.S3({
  accessKeyId: S3Config.AccesskeyID,
  secretAccessKey: S3Config.Secretaccesskey,
  region: S3Config.region,
});

function RenderPoster({
  selectedPoster,
  setImgConfig,
  imgConfig,
  category,
  selectItem,
}) {
  const selectImage = () => {
    const options = {
      title: '사진 선택',
      quality: 0.3,
    };

    launchImageLibrary(options, async response => {
      if (response.didCancel) {
        console.log('사용자가 이미지 선택을 취소했습니다.');
      } else if (response.error) {
        console.log('ImagePicker 에러: ', response.error);
      } else if (response.customButton) {
        console.log('사용자 정의 버튼 클릭: ', response.customButton);
      } else {
        setImgConfig(response.assets[0]);
      }
    });
  };

  if (category === 'Movie') {
    return selectedPoster ? (
      <FastImage
        source={{uri: selectedPoster}}
        style={{flex: 1, aspectRatio: 0.7, width: '60%', borderRadius: 10}}
        resizeMode="stretch"
      />
    ) : imgConfig ? (
      <FastImage
        source={{uri: imgConfig.uri}}
        style={{flex: 1, aspectRatio: 0.7, width: '60%', borderRadius: 10}}
        resizeMode="stretch"
      />
    ) : (
      <TouchableOpacity
        style={{
          flex: 1,
          aspectRatio: 0.7,
          width: '60%',
          backgroundColor: 'grey',
          opacity: 1,
          borderRadius: 15,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={() => selectImage()}>
        <AntDesign
          name="pluscircleo"
          size={50}
          color="white"
          style={{opacity: 0.6}}
        />
      </TouchableOpacity>
    );
  } else {
    return (
      <FastImage
        source={{uri: selectItem.image}}
        style={{flex: 1, aspectRatio: 0.7, width: '60%', borderRadius: 10}}
        resizeMode="stretch"
      />
    );
  }
}

function GetActorsNm(actors) {
  const Nm = actors.slice(0, 6).map(actor => actor.actorNm);
  const actor = JSON.stringify(Nm)
    .replace('[', '')
    .replace(']', '')
    .replace(/"/g, "'")
    .replace(/,/g, ', ');

  return actor;
}

function GetActors({actors}) {
  if (!actors) return;
  return actors.slice(0, 6).map((actor, index) => {
    return (
      <Text style={styles.movieActors} key={index}>
        &nbsp;`{actor.actorNm}`
      </Text>
    );
  });
}

function RenderPlot({category, selectItem}) {
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
    <View>
      {selectItem && (
        <ReadMore
          numberOfLines={3}
          renderTruncatedFooter={_renderTruncatedFooter}
          renderRevealedFooter={_renderRevealedFooter}>
          <Text style={{fontFamily: font.mainFont}}>
            {category === 'Movie'
              ? selectItem.plots.plot[0].plotText
              : selectItem.description}
          </Text>
        </ReadMore>
      )}
    </View>
  );
}

function RenderActors({category, selectItem}) {
  if (category === 'Movie') {
    return (
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginBottom: '5%',
        }}>
        {selectItem && <Text>출연:</Text>}
        {selectItem && selectItem.actors && category === 'Movie' && (
          <GetActors actors={selectItem.actors.actor} />
        )}
      </View>
    );
  }
}

function RenderTitle({selectItem, addTitle, onChangeAddTitle}) {
  return selectItem ? (
    <Text
      style={{
        fontFamily: font.boldFont,
        fontSize: 19,
        marginVertical: '4%',
        marginBottom: '6%',
        paddingHorizontal: '12%',
        opacity: 0.8,
        textAlign: 'center',
      }}>
      {selectItem.title}
    </Text>
  ) : (
    <TextInput
      value={addTitle}
      onChangeText={onChangeAddTitle}
      placeholder="제목"
      style={{
        height: 60,
        fontSize: 18,
        alignSelf: 'center',
        fontFamily: font.boldFont,
      }}></TextInput>
  );
}

function Header({closeSelectModal, AddRememberBook}) {
  return (
    <View style={styles.addReviewHeader}>
      <TouchableOpacity onPress={() => closeSelectModal()}>
        <Text
          style={{
            padding: 15,
            fontFamily: font.mainFont,
            color: 'red',
            fontSize: 17,
          }}>
          취소
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => AddRememberBook()}>
        <Text style={{padding: 15, fontFamily: font.mainFont, fontSize: 17}}>
          저장
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function RenderRate({rate, handleRate, vibrationRef, colorTheme}) {
  const disLikeColor = rate === 'dislike' ? 'white' : null;
  const likeColor = rate === 'like' ? 'white' : null;

  return (
    <View
      style={{
        flexDirection: 'row',
        // justifyContent: 'center',
        marginBottom: '4%',
        marginTop: '-1%',
        height: 40,
        paddingHorizontal: '3%',
      }}>
      <VibrationComponent
        ref={vibrationRef}
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'center',
        }}>
        <TouchableOpacity
          style={[
            styles.moodTouchable,
            rate === 'like' && {transform: [{scale: 1.1}]},
            {marginRight: '3%'},
          ]}
          onPress={() => handleRate('like')}>
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
            styles.moodTouchable,
            rate === 'dislike' && {transform: [{scale: 1.1}]},
          ]}
          onPress={() => handleRate('dislike')}>
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
      </VibrationComponent>
    </View>
  );
}

function AddItem({
  selectItem,
  setSelectItem,
  selectedPoster,
  isSelectModal,
  setIsSelectModal,
  closeAddModal,
  loadRememberBooks,
  category,
}) {
  const [addTitle, setAddTitle] = useState(null);
  const [review, setReview] = useState(null);
  const [imgConfig, setImgConfig] = useState(null);
  const [rate, setRate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const vibrationRef = useRef(null);
  const {user} = useContext(ThemeContext);
  const {colorTheme, getRememberBook} = useContext(ThemeContext);

  const uploadImageToS3 = async () => {
    if (!imgConfig) return;
    return new Promise(async (resolve, reject) => {
      const fileData = await RNFS.readFile(imgConfig.uri, 'base64');

      const params = {
        Bucket: S3Config.bucket,
        Key: imgConfig.fileName,
        Body: Buffer.from(fileData, 'base64'),
        ACL: 'public-read',
        ContentType: imgConfig.type,
      };

      s3.upload(params, function (err, data) {
        if (err) {
          reject(err);
        } else {
          console.log(`파일이 성공적으로 업로드되었습니다. ${data.Location}`);
          resolve(data.Location);
        }
      });
    });
  };

  const AddRememberBook = async () => {
    try {
      if (rate == null) {
        triggerVibration();
        return;
      }
      let self = 0;
      if (!selectItem) self = 1;
      const imgUrlRespons = await uploadImageToS3();
      const actors =
        selectItem && category === 'Movie'
          ? GetActorsNm(selectItem.actors.actor)
          : null;
      const response = await axios.post(
        `http://${serverIP}:3003/addRememberBook`,
        {
          user: user,
          title: selectItem ? selectItem.title : addTitle,
          category: category,
          plot:
            selectItem && category === 'Movie'
              ? selectItem.plots.plot[0].plotText
              : null,
          img_url: imgUrlRespons
            ? imgUrlRespons
            : category === 'Movie'
            ? selectedPoster
            : selectItem.image,
          rate: rate,
          actors: selectItem && actors,
          review: review,
          creater:
            category === 'Book'
              ? selectItem
                ? selectItem.author
                : null
              : selectItem
              ? selectItem.directors.director[0].directorNm
              : null,
        },
      );
      getRememberBook(category);
      closeAddModal();
      closeSelectModal();
    } catch (error) {
      console.log(error);
    }
  };

  const handleRate = option => {
    setRate(option);
  };

  const closeSelectModal = () => {
    setIsSelectModal(false);
    setSelectItem(null);
    setImgConfig(null);
    setRate(null);
    setAddTitle(null);
    setReview(null);
  };

  const onChangeAddTitle = text => {
    setAddTitle(text);
  };

  const onChangeReview = text => {
    setReview(text);
  };

  const triggerVibration = () => {
    vibrationRef.current.startVibration();
  };

  return (
    <Modal
      visible={isSelectModal}
      onRequestClose={() => closeSelectModal()}
      style={{marginTop: 300}}
      animationType="slide"
      presentationStyle="pageSheet">
      {isLoading ? (
        <KeyboardAwareScrollView keyboardShouldPersistTaps="handled">
          <ScrollView
            contentContainerStyle={{
              paddingBottom: '20%',
              marginHorizontal: '10%',
            }}
            keyboardShouldPersistTaps="handled">
            <Header
              closeSelectModal={closeSelectModal}
              AddRememberBook={AddRememberBook}
            />
            <RenderTitle
              selectItem={selectItem}
              addTitle={addTitle}
              onChangeAddTitle={onChangeAddTitle}
            />
            <View
              style={{
                alignItems: 'center',
              }}>
              <RenderPoster
                selectedPoster={selectedPoster}
                setImgConfig={setImgConfig}
                imgConfig={imgConfig}
                category={category}
                selectItem={selectItem}
              />
            </View>
            <View
              style={{
                marginTop: '7%',
              }}>
              <RenderRate
                rate={rate}
                handleRate={handleRate}
                vibrationRef={vibrationRef}
                colorTheme={colorTheme}
              />
              <TextInput
                value={review}
                onChangeText={onChangeReview}
                placeholder={'보고 느낀 점을 남겨보세요'}
                style={{
                  textAlignVertical: 'top',
                  fontFamily: font.mainFont,
                  height: 130,
                  padding: 5,
                  borderWidth: 1,
                  borderRadius: 4,
                  borderColor: 'lightgrey',
                  marginBottom: 10,
                }}
                multiline={true}></TextInput>
              <RenderActors category={category} selectItem={selectItem} />
              <RenderPlot category={category} selectItem={selectItem} />
            </View>
          </ScrollView>
        </KeyboardAwareScrollView>
      ) : (
        <View style={{flex: 1, justifyContent: 'center'}}>
          <ActivityIndicator
            animating={true}
            size={'large'}
            color={colorTheme.hexCode2}
          />
        </View>
      )}
    </Modal>
  );
}

const SearchInput = ({category, getMovie, getBook}) => {
  const [searchTitle, setSearchTitle] = useState('');
  const {colorTheme} = useContext(ThemeContext);
  const onChangeSearchTitle = text => {
    setSearchTitle(text);
  };

  return (
    <View style={{marginTop: '5%'}}>
      <TextInput
        placeholder="제목으로 검색해보세요"
        value={searchTitle}
        onChangeText={onChangeSearchTitle}
        style={{
          // marginTop: '5%',
          alignSelf: 'center',
          borderBottomWidth: 1,
          paddingVertical: 4,
          paddingHorizontal: 8,
          marginHorizontal: 23,
          width: windowWidth * 0.4,
          fontFamily: font.mainFont,
          borderColor: colorTheme.hexCode2,
          marginBottom: 25,
        }}
        onSubmitEditing={
          category === 'Movie'
            ? () => getMovie(searchTitle)
            : () => getBook(searchTitle)
        }
      />
    </View>
  );
};

function AddModal({isAddModal, setIsAddModal, loadRememberBooks, category}) {
  const [searchTitle, setSearchTitle] = useState('');
  const [movieList, setMovieList] = useState(false);
  const [bookList, setBookList] = useState(false);
  const [isSelectModal, setIsSelectModal] = useState(false);
  const [selectItem, setSelectItem] = useState(null);
  const [selectedPoster, setSelectedPoster] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const {colorTheme} = useContext(ThemeContext);

  const onChangeSearchTitle = payload => {
    setSearchTitle(payload);
  };

  const closeAddModal = () => {
    setIsAddModal(false);
    setSearchTitle('');
    setMovieList(false);
    setBookList(false);
  };

  const getBook = searchTitle => {
    setIsLoading(true);
    const url = `https://openapi.naver.com/v1/search/book.json?query=${searchTitle}&sort=sim&display=100`;
    const clientId = 'rfJc3O9jzG0pjqwHZ4hY';
    const clientSecret = 'bv8Tr9bHKK';

    fetch(url, {
      method: 'GET',
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    })
      .then(response => response.json())
      .then(data => {
        if (data.total === 0) {
          setIsLoading(false);
          setBookList(null);
          return;
        }
        setBookList(data.items);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  const getMovie = searchTitle => {
    setIsLoading(true);
    const temp = searchTitle.replace(/ /g, '');
    if (temp === '') {
      setMovieList(null);
      setIsLoading(false);

      return;
    }
    const url = `http://api.koreafilm.or.kr/openapi-data2/wisenut/search_api/search_json2.jsp?collection=kmdb_new2&ServiceKey=E478HE6ENQTOVTL8S7JA&title=${temp}&listCount=100`;
    fetch(url)
      .then(response => response.json())
      .then(json => {
        if (json.TotalCount === 0) {
          setIsLoading(false);
          setMovieList(null);
          return;
        }
        const filteredResults = json.Data[0].Result;
        for (let i = 0; i < filteredResults.length; i++) {
          filteredResults[i].title = filteredResults[i].title
            .replace(/ !HS /g, '')
            .replace(/ !HE /g, '');
        }
        let movie = filteredResults.filter(e => e.posters !== '');
        let noPosterMovie = filteredResults.filter(e => e.posters === '');
        movie.push(...noPosterMovie);
        setIsLoading(false);
        setMovieList(movie);
        console.log(`RMFb API 성공asd`);
      })
      .catch(error => console.error(error));
  };

  const openSelectModal = (item, poster) => {
    setSelectItem(item);
    setSelectedPoster(poster[0]);
    setIsSelectModal(true);
  };

  const Item = ({item, category}) => {
    const poster = category === 'Movie' && item.posters.split('|');
    const imageSource =
      category === 'Movie'
        ? poster[0].length
          ? {uri: poster[0]}
          : require('../image/noimg4.png')
        : {uri: item.image};

    return (
      <TouchableOpacity
        style={{
          flex: 1,
          flexDirection: 'row',
          // marginBottom: '4%',
          padding: 10,
        }}
        onPress={() => openSelectModal(item, poster)}>
        <View style={{position: 'relative', flex: 0.8}}>
          <FastImage
            style={[
              [styles.movieImage],
              {
                transform: [
                  {
                    scale:
                      category === 'Movie' ? (poster[0].length ? 1 : 0.9) : 1,
                  },
                ],
              },
            ]}
            source={imageSource}
            resizeMode="stretch"
          />
          {category === 'Book' && <View style={styles.bookLine}></View>}
        </View>
        <View style={styles.movieInfo}>
          <Text numberOfLines={1} style={styles.movieTitle}>
            {item.title}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              // justifyContent: 'space-between',
            }}>
            <Text style={{marginBottom: '2%', fontFamily: font.mainFont}}>
              {category === 'Movie' ? '감독:' : '저자: '}
            </Text>
            <Text style={styles.movieDirector}>
              {category === 'Movie'
                ? item.directors.director[0].directorNm
                : item.author}
            </Text>
          </View>
          <Text style={styles.moviePlotText} numberOfLines={3}>
            {category === 'Movie'
              ? item.plots.plot[0].plotText
              : item.description}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const ManualAdd = () => {
    const {colorTheme} = useContext(ThemeContext);

    return (
      <View style={styles.manualAddContainer}>
        <View
          style={{alignItems: 'center', flex: 1, justifyContent: 'flex-end'}}>
          <Text style={styles.manualAddText}>검색된 결과가 없습니다</Text>
          <TouchableOpacity
            style={{flexDirection: 'row'}}
            onPress={() => openSelectModal(null, [])}>
            <MaterialIcons
              name="add"
              size={15}
              style={{color: colorTheme.hexCode}}
            />
            <Text
              style={{
                fontFamily: font.boldFont,
                color: colorTheme.hexCode,
                fontSize: 15,
              }}>
              직접추가
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            flex: 1,
            // backgroundColor: 'red',
            width: '100%',
            justifyContent: 'flex-end',
          }}>
          <View
            style={{
              width: '80%',
              height: '30%',
              backgroundColor: colorTheme.hexCode,
              marginBottom: '10%',
              alignSelf: 'center',
              justifyContent: 'center',
              borderRadius: 15,
            }}>
            <Text
              style={{
                marginLeft: 10,
                color: 'white',
                fontFamily: font.boldFont,
              }}>
              검색어를 이렇게 수정해 보세요.
            </Text>
            <Text style={{color: 'white', fontFamily: font.mainFont}}>
              {'        '}✓ 검색하실 단어(예: 콘크리트 유토피아)
            </Text>
            <Text style={{color: 'white', fontFamily: font.mainFont}}>
              {'        '}✓ 검색어: 콘크리트 X 콘크리트 유토피아 O
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const RenderContent = () => {
    if (isLoading) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
          }}>
          <ActivityIndicator
            animating={true}
            size={'large'}
            color={colorTheme.hexCode2}
          />
        </View>
      );
    } else if (movieList || bookList) {
      return (
        <FlatList
          data={category === 'Movie' ? movieList : bookList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => <Item item={item} category={category} />}
        />
      );
    } else if (movieList === null || bookList === null) {
      return <ManualAdd />;
    }
  };

  return (
    <Modal
      visible={isAddModal}
      onRequestClose={() => closeAddModal()}
      style={{marginTop: 300}}
      animationType="slide"
      presentationStyle="pageSheet">
      <View style={{flex: 1}}>
        <SearchInput
          category={category}
          getBook={getBook}
          getMovie={getMovie}
        />
        <AddItem
          selectItem={selectItem}
          setSelectItem={setSelectItem}
          selectedPoster={selectedPoster}
          isSelectModal={isSelectModal}
          setIsSelectModal={setIsSelectModal}
          closeAddModal={closeAddModal}
          loadRememberBooks={loadRememberBooks}
          category={category}
        />
        <RenderContent />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  movieImage: {
    flex: 0.7,
    height: windowHeight / 4.8,
    width: windowWidth / 3,
    // scale: 0.6,
    alignSelf: 'center',
    borderRadius: 4,
    // borderBottomRightRadius: 30,
    // borderTopRightRadius: 15,
    marginRight: '2%',
  },
  movieInfo: {
    // alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    // flex: 1,
    width: windowWidth / 2,
    padding: '4%',
    paddingLeft: '5%',
    // borderBottomWidth: 1,
    // paddingBottom: '10%',
    paddingTop: '2%',
  },
  movieTitle: {
    fontSize: 18,
    // fontWeight: 'bold',
    // textAlign: 'center',
    // borderWidth: 1,
    // alignSelf: 'center',
    marginBottom: '15%',
    fontFamily: font.boldFont,
  },
  moviePlotText: {
    // textAlign: 'center',
    marginTop: 2,
    fontFamily: font.mainFont,
  },
  movieDirector: {
    marginBottom: '3%',
    fontFamily: font.mainFont,
  },
  movieActors: {fontFamily: font.mainFont},
  manualAddContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  manualAddText: {
    textAlign: 'center',
    fontFamily: font.mainFont,
  },
  addReviewHeader: {
    flex: 0.1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookLine: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'white',
    height: '100%',
    left: '4%',
    borderStyle: 'dashed',
  },
  moodTouchable: {
    width: '30%',
    borderRadius: 100,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});

export default AddModal;
