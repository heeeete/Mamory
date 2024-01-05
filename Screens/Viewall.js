import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  TextInput,
  Animated,
} from 'react-native';
import {useEffect, useState, useCallback, useContext, useRef} from 'react';
import font from '../Styles/font';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import MyTextinput from './component/MyTextinput';
import {SafeAreaView} from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import {ThemeContext} from './Context/ThemeContext';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';

const screenWidth = Dimensions.get('window').width;

function RenderItem({item}) {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={{aspectRatio: 0.68, width: '30%', marginBottom: '10%', padding: 4}}
      onPress={() => navigation.navigate('ShowMore', {item})}>
      <FastImage
        source={
          item.img_url ? {uri: item.img_url} : require('../image/noimg4.png')
        }
        style={{
          width: '100%',
          height: '100%',
          opacity: 1,
          transform: item.img_url ? [{scale: 1}] : [{scale: 0.5}],
          borderRadius: 10,
          marginVertical: '10%',
        }}
        resizeMode="stretch"
      />
      <Text
        style={{fontFamily: font.boldFont, alignSelf: 'center'}}
        numberOfLines={1}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );
}

function Viewall({route}) {
  const {category, value} = route.params;
  const {movieLikeItem, movieDisLikeItem, bookLikeItem, bookDisLikeItem} =
    useContext(ThemeContext);
  const [filterMovies, setFilterMovies] = useState(data);
  const [numColumns, setNumColumns] = useState(3);
  const [searchText, setSearchText] = useState('');
  const {colorTheme} = useContext(ThemeContext);
  const [pressSearch, setPressSearch] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const data =
    category === 'Movie'
      ? value === 'like'
        ? movieLikeItem
        : movieDisLikeItem
      : value === 'like'
      ? bookLikeItem
      : bookDisLikeItem;
  const searchBarTranslateY = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, -60], // -60은 검색창의 높이를 의미한다고 가정합니다.
    extrapolate: 'clamp',
  });

  useEffect(() => {
    const data =
      category === 'Movie'
        ? value === 'like'
          ? movieLikeItem
          : movieDisLikeItem
        : value === 'like'
        ? bookLikeItem
        : bookDisLikeItem;
    setFilterMovies(data);
    onChangeSearchText(searchText);
  }, [movieLikeItem, movieDisLikeItem, bookLikeItem, bookDisLikeItem]);

  const onChangeSearchText = text => {
    setSearchText(text);

    //		textinput이 변할때 마다 영화 검색
    if (text) {
      const results = data.filter(movie =>
        movie.title.toLowerCase().includes(text.toLowerCase()),
      );
      setFilterMovies(results);
    } else {
      setFilterMovies(data);
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}} edges={['top']}>
      {pressSearch === false ? (
        <TouchableOpacity
          style={{
            width: 44,
            height: 44,
            marginRight: 20,
            justifyContent: 'center',
            alignSelf: 'flex-end',
          }}
          onPress={() => {
            setPressSearch(true);
          }}>
          <FontAwesome
            name="search"
            size={21}
            color={colorTheme.hexCode2}
            style={{
              alignSelf: 'flex-end',
              opacity: 0.7,
            }}
          />
        </TouchableOpacity>
      ) : (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginLeft: 10,
            alignItems: 'center',
          }}>
          <TouchableOpacity
            style={{
              width: 44,
              height: 44,
              justifyContent: 'center',
            }}
            onPress={() => {
              setPressSearch(false);
              setSearchText('');
              onChangeSearchText('');
            }}>
            <Entypo
              name="chevron-left"
              size={22}
              color={colorTheme.hexCode2}
              style={{}}
            />
          </TouchableOpacity>
          <TextInput
            placeholder="제목으로 검색해보세요"
            value={searchText}
            onChangeText={onChangeSearchText}
            style={{
              alignSelf: 'center',
              borderBottomWidth: 1,
              paddingVertical: 2,
              paddingHorizontal: 9,
              marginHorizontal: 25,
              width: screenWidth * 0.4,
              fontFamily: font.mainFont,
              borderColor: 'lightgrey',
            }}
          />
        </View>
      )}
      <View
        style={{
          width: '100%',
          borderBottomWidth: 1,
          borderColor: 'lightgrey',
          width: '90%',
          alignSelf: 'center',
        }}></View>
      <FlatList
        columnWrapperStyle={{justifyContent: 'space-evenly'}}
        style={{paddingHorizontal: 10}}
        contentContainerStyle={{paddingBottom: 10}}
        data={filterMovies}
        keyExtractor={item => item.idx}
        renderItem={({item}) => <RenderItem item={item} />}
        numColumns={numColumns}
      />
    </SafeAreaView>
  );
}

export default Viewall;
