import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  FlatList,
  Platform,
  Image,
} from 'react-native';
import {useContext, useEffect, useRef, useState} from 'react';
import Modal2 from 'react-native-modal';
//------------------icon-----------------------
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Octicons from 'react-native-vector-icons/Octicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
//------------------icon-----------------------
import {Provider as PaperProvider} from 'react-native-paper';
import {papertheme} from '../Styles/react-native-paper-theme'; // theme.js에서 theme 가져오기
import axios from 'axios';
import font from '../Styles/font';
import AddModal from './Bookaddmodal';
import {useNavigation} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import {ThemeContext} from './Context/ThemeContext';
import {useSafeAreaFrame} from 'react-native-safe-area-context';
import {TextInput} from 'react-native-gesture-handler';

const serverIP = '43.200.88.208';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const underlineColor = 'pink'; // focus 상태일 때와 아닐 때의 색상
const viewAll = {title: 'viewAll', review: 'viewAll'};

function MenuModal({isMenuModal, setIsMenuModal, setCategory, category}) {
  const onBackdropPress = () => setIsMenuModal(prevStatus => !prevStatus);
  const {colorTheme} = useContext(ThemeContext);

  const selectCategory = category => {
    setCategory(category);
    setIsMenuModal(prevStatus => !prevStatus);
  };

  return (
    <View style={styles.modalContainer}>
      <Modal2
        isVisible={isMenuModal}
        onBackdropPress={() => onBackdropPress()}
        backdropColor={'none'}
        style={styles.modalStyle}
        animationInTiming={1}
        animationOutTiming={1}>
        <View style={styles.modalView}>
          <TouchableOpacity onPress={() => selectCategory('Movie')}>
            <View
              style={{
                ...styles.categoryMenu,
                backgroundColor: category === 'Movie' ? colorTheme.hexCode : {},
              }}>
              <Text
                style={{
                  color: 'black',
                  opacity: 0.7,
                  fontSize: 17,
                  fontFamily: font.boldFont,
                  color: category === 'Movie' ? 'white' : {},
                }}>
                영화
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => selectCategory('Book')}>
            <View
              style={{
                ...styles.categoryMenu,
                backgroundColor: category === 'Book' ? colorTheme.hexCode : {},
              }}>
              <Text
                style={{
                  opacity: 0.7,
                  color: 'black',
                  fontSize: 17,
                  fontFamily: font.boldFont,
                  color: category === 'Book' ? 'white' : {},
                }}>
                책
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </Modal2>
    </View>
  );
}

function RememberBook({route, navigation}) {
  const [isMenuModal, setIsMenuModal] = useState(false);
  const [isAddModal, setIsAddModal] = useState(false);
  const [likeItem, setLikeItem] = useState([]);
  const [disLikeItem, setDisLikeItem] = useState([]);
  const [category, setCategory] = useState('Movie');
  const {colorTheme} = useContext(ThemeContext);
  const likeFlatListRef = useRef();
  const disFlatListRef = useRef();
  const {movieLikeItem, movieDisLikeItem, bookLikeItem, bookDisLikeItem} =
    useContext(ThemeContext);

  const openCategoryModal = () => setIsMenuModal(prevStatus => !prevStatus);
  const openAddModal = () => setIsAddModal(prevStatus => !prevStatus);

  useEffect(() => {
    navigation.addListener('focus', () => {
      handleScrollToTop();
    });
  }, [navigation]);

  useEffect(() => {
    loadBook();
  }, [bookLikeItem, bookDisLikeItem]);
  const loadBook = () => {
    const item = JSON.parse(JSON.stringify(bookLikeItem));
    const disItem = JSON.parse(JSON.stringify(bookDisLikeItem));
    if (item.length != 0 && item.length >= 10) item.splice(10, 0, viewAll);
    if (disItem.length != 0 && disItem.length >= 10)
      disItem.splice(10, 0, viewAll);
    setLikeItem(item);
    setDisLikeItem(disItem);
    handleScrollToTop();
  };

  useEffect(() => {
    loadMovie();
  }, [movieLikeItem, movieDisLikeItem]);
  const loadMovie = () => {
    const item = JSON.parse(JSON.stringify(movieLikeItem));
    const disItem = JSON.parse(JSON.stringify(movieDisLikeItem));
    if (item.length != 0 && item.length >= 10) item.splice(10, 0, viewAll);
    if (disItem.length != 0 && disItem.length >= 10)
      disItem.splice(10, 0, viewAll);
    setLikeItem(item);
    setDisLikeItem(disItem);
    handleScrollToTop();
  };

  useEffect(() => {
    loadCategory();
  }, [category]);
  const loadCategory = () => {
    try {
      const item =
        category === 'Movie'
          ? JSON.parse(JSON.stringify(movieLikeItem))
          : JSON.parse(JSON.stringify(bookLikeItem));
      const disItem =
        category === 'Movie'
          ? JSON.parse(JSON.stringify(movieDisLikeItem))
          : JSON.parse(JSON.stringify(bookDisLikeItem));

      if (item.length != 0 && item.length >= 10) item.splice(10, 0, viewAll);
      if (disItem.length != 0 && disItem.length >= 10)
        disItem.splice(10, 0, viewAll);
      setLikeItem(item);
      setDisLikeItem(disItem);
      handleScrollToTop();
    } catch (error) {
      console.log(error);
    }
  };

  const handleScrollToTop = () => {
    likeFlatListRef.current?.scrollToOffset({animated: true, offset: 0}); // 스크롤을 최상단으로 이동
    disFlatListRef.current?.scrollToOffset({animated: true, offset: 0}); // 스크롤을 최상단으로 이동
  };

  const ViewAllButton = ({navigation, value}) => (
    <TouchableOpacity
      style={styles.commonTouchable}
      onPress={() => navigation.navigate('Viewall', {category, value})}>
      <View style={styles.shadow}>
        <SimpleLineIcons
          name="arrow-right-circle"
          size={36}
          color={colorTheme.hexCode2}
        />
      </View>
      <Text style={styles.greyText}>더보기</Text>
    </TouchableOpacity>
  );

  const Item = ({item, navigation}) => {
    return (
      <TouchableOpacity
        style={{...styles.commonTouchable}}
        onPress={() =>
          navigation.navigate('ShowMore', {
            item,
          })
        }>
        <FastImage
          source={
            item.img_url ? {uri: item.img_url} : require('../image/noimg4.png')
          }
          style={{
            ...styles.itemImage,
            transform: [{scale: item.img_url ? 0.85 : 0.6}],
          }}
          resizeMode="stretch"
        />
        <Text
          style={{
            fontFamily: font.boldFont,
            marginTop: '4%',
            paddingHorizontal: 12,
          }}
          numberOfLines={1}>
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  };

  const LikeItem = ({item, idx}) => {
    const navigation = useNavigation();

    if (idx > 10) return null;
    if (idx > 0 && item.title === 'viewAll')
      return <ViewAllButton navigation={navigation} value="like" />;
    if (item.rate === 'like')
      return <Item item={item} navigation={navigation} />;
    return null; // 기본 반환값
  };

  const DisLikeItem = ({item, idx}) => {
    const navigation = useNavigation();

    if (idx > 10) return null;
    if (idx > 0 && item.title === 'viewAll')
      return <ViewAllButton navigation={navigation} value={'disLike'} />;
    if (item.rate === 'dislike')
      return <Item item={item} navigation={navigation} />;
    return null; // 기본 반환값
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <View style={styles.inner}>
        <View style={styles.menuContainer}>
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.headersText}>
              {category === 'Movie' ? '영화' : '책'}
            </Text>
            <TouchableOpacity
              onPress={() => openCategoryModal()}
              style={styles.iconContainer}>
              <MaterialIcons name="keyboard-arrow-down" size={22} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={{
              width: 44,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={openAddModal}>
            <Ionicons name="add-outline" size={25} />
          </TouchableOpacity>
        </View>
        <View style={{flex: 0.45}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: '2%',
            }}>
            <Octicons name="thumbsup" color={colorTheme.hexCode} size={15} />
            <Text
              style={{
                fontFamily: font.boldFont,
                marginLeft: 3,
                // color: 'darkgrey',
              }}>
              재밌어요
            </Text>
          </View>
          <FlatList
            ref={likeFlatListRef}
            contentContainerStyle={{}}
            data={likeItem}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index}) => <LikeItem item={item} idx={index} />}
            showsHorizontalScrollIndicator={false}
            horizontal={true}
          />
        </View>
        <View style={{flex: 0.45}}>
          <View
            style={{
              flexDirection: 'row',
              // alignItems: 'center',
              marginBottom: '2%',
            }}>
            <Octicons
              name="thumbsdown"
              color={colorTheme.hexCode}
              size={15}
              style={{alignSelf: 'flex-end'}}
            />
            <Text style={{fontFamily: font.boldFont, marginLeft: 3}}>
              별로에요
            </Text>
          </View>
          <FlatList
            ref={disFlatListRef}
            contentContainerStyle={{alignItems: 'flex-start'}} // 여백 추가
            data={disLikeItem}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index}) => (
              <DisLikeItem item={item} idx={index} />
            )}
            showsHorizontalScrollIndicator={false}
            horizontal={true}
          />
        </View>
      </View>
      <MenuModal
        isMenuModal={isMenuModal}
        setIsMenuModal={setIsMenuModal}
        setCategory={setCategory}
        category={category}
      />
      <AddModal
        isAddModal={isAddModal}
        setIsAddModal={setIsAddModal}
        category={category}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
    paddingHorizontal: '5%',
  },
  menuContainer: {
    flex: 0.05,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '5%',
  },
  iconContainer: {
    // backgroundColor: 'red',
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    // padding: 5,
  },
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalStyle: {
    justifyContent: 'flex-start',
    ...Platform.select({
      ios: {
        marginTop: '23%',
      },
      android: {
        marginTop: '10%',
      },
    }),
  },
  modalView: {
    width: '24%',
    height: 'auto',
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'lightgrey',
  },
  categoryMenu: {
    alignItems: 'center',
    borderRadius: 20,
    fontSize: 20,
    paddingVertical: 15,
    margin: 5,
  },
  commonTouchable: {
    aspectRatio: 0.7,
    height: '81%',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadow: {
    // shadowColor: 'black',
    // shadowOffset: {width: 3, height: 3},
    // shadowRadius: 1,
    // shadowOpacity: 0.3,
  },
  greyText: {
    fontFamily: font.boldFont,
    color: 'grey',
    marginTop: '7%',
  },
  itemImage: {
    marginTop: '20%',
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  headersText: {
    // backgroundColor: 'green',
    alignSelf: 'center',
    fontFamily: font.mainFont,
    fontSize: 20,
  },
});

export default RememberBook;
