import React, {useEffect, useState} from 'react';
import {ThemeContext} from '../Context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {View, Text} from 'react-native';
import axios from 'axios';
import Video, {VideoRef} from 'react-native-video';
import {tr} from 'date-fns/locale';

const serverIP = '43.200.88.208';

function LoadingScreen() {
  return <View style={{flex: 1, backgroundColor: 'red'}}></View>;
}

export const ThemeProvider = ({children}) => {
  const [colorTheme, setColorTheme] = useState({
    color: 'defaultColor',
    hexCode: '#000000',
    hexCode2: '#000000',
  });
  const [user, setUser] = useState(null);
  const [birth, setBirth] = useState(null);
  const [nick, setNick] = useState(null);
  const [movieLikeItem, setMovieLikeItem] = useState(null);
  const [movieDisLikeItem, setMovieDisLikeItem] = useState(null);
  const [bookLikeItem, setBookLikeItem] = useState(null);
  const [bookDisLikeItem, setBookDisLikeItem] = useState(null);
  const [loading, setLoading] = useState(true);
  // AsyncStorage.removeItem('userData');
  //어플 시작시 로컬스토리지에 저장된 color key GET 해서 색상 적용
  //어플 시작시 한번만 실행
  useEffect(() => {
    const getColor = async () => {
      const theme = await AsyncStorage.getItem('color');
      if (theme) setColorTheme(JSON.parse(theme));
    };
    const getUser = async () => {
      const user = await AsyncStorage.getItem('userData');
      if (user) {
        setUser(JSON.parse(user).id);
        setNick(JSON.parse(user).nickname);
        setBirth(JSON.parse(user).birthday);
      } else {
        setUser('none');
        setNick('none');
        setBirth('none');
      }
    };
    getColor();
    getUser();
  }, []);

  //rememberbooks 데이터 가지고 오기
  useEffect(() => {
    if (user) getRememberBook();
  }, [user]);
  const getRememberBook = async category => {
    if (category) {
      try {
        const likeResponse = await axios.get(
          `http://${serverIP}:3003/getMovie`,
          {
            params: {
              user: user,
              category: category,
              rate: 'like',
            },
          },
        );
        const disLikeResponse = await axios.get(
          `http://${serverIP}:3003/getMovie`,
          {
            params: {
              user: user,
              category: category,
              rate: 'dislike',
            },
          },
        );
        const likeItem = await likeResponse.data.reverse();
        const disLikeItem = await disLikeResponse.data.reverse();

        if (category === 'Movie') {
          setMovieLikeItem(likeItem);
          setMovieDisLikeItem(disLikeItem);
        } else {
          setBookLikeItem(likeItem);
          setBookDisLikeItem(disLikeItem);
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        const movieLikeResponse = await axios.get(
          `http://${serverIP}:3003/getMovie`,
          {
            params: {
              user: user,
              category: 'Movie',
              rate: 'like',
            },
          },
        );
        const movieDisLikeResponse = await axios.get(
          `http://${serverIP}:3003/getMovie`,
          {
            params: {
              user: user,
              category: 'Movie',
              rate: 'dislike',
            },
          },
        );
        const bookLikeResponse = await axios.get(
          `http://${serverIP}:3003/getMovie`,
          {
            params: {
              user: user,
              category: 'Book',
              rate: 'like',
            },
          },
        );
        const bookDisLikeResponse = await axios.get(
          `http://${serverIP}:3003/getMovie`,
          {
            params: {
              user: user,
              category: 'Book',
              rate: 'dislike',
            },
          },
        );

        const movieLikeItem = movieLikeResponse.data.reverse();
        const movieDisLikeItem = movieDisLikeResponse.data.reverse();
        const bookLikeItem = bookLikeResponse.data.reverse();
        const bookDisLikeItem = bookDisLikeResponse.data.reverse();

        setMovieLikeItem(movieLikeItem);
        setMovieDisLikeItem(movieDisLikeItem);
        setBookLikeItem(bookLikeItem);
        setBookDisLikeItem(bookDisLikeItem);
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    }
  };

  if (loading) {
    return <View style={{flex: 1}}></View>;
  }

  return (
    <ThemeContext.Provider
      value={{
        colorTheme,
        setColorTheme,
        user,
        setUser,
        nick,
        setNick,
        birth,
        setBirth,
        movieLikeItem,
        setMovieLikeItem,
        movieDisLikeItem,
        setMovieDisLikeItem,
        bookLikeItem,
        setBookLikeItem,
        bookDisLikeItem,
        setBookDisLikeItem,
        getRememberBook,
      }}>
      {children}
    </ThemeContext.Provider>
  );
};
