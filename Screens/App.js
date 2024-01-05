import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AddDiary from './AddDiary';
import Main from './Main';
import Addinfo from './Login';
import ViewDiary from './ViewDiary';
import ModifyDiary from './ModifyDiary';
import Todo from './Todo';
import RememberBook from './RememberBook';
import ShowMore from './ShowMore';
import Viewall from './Viewall';
import MyPage from './MyPage';
import SplashScreen from 'react-native-splash-screen';
import {useContext, useEffect, useState} from 'react';
import {View, Platform} from 'react-native';
//아이콘
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
//아이콘
import {ThemeProvider} from './Provider/ThemeProvider';
import {ThemeContext} from './Context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Video, {VideoRef} from 'react-native-video';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const serverIP = '43.200.88.208';

function MainTab() {
  const {colorTheme} = useContext(ThemeContext);

  const tabScreenOptions = ({route}) => ({
    headerShown: false,
    tabBarLabel: () => null,
    tabBarIcon: ({focused, color, size}) => {
      if (route.name === 'Main') {
        return focused ? (
          <View
            style={
              {
                // backgroundColor: colorTheme.hexCode,
                // padding: 10,
                // borderRadius: 10,
              }
            }>
            <AntDesign
              name="home"
              size={25}
              color={colorTheme.color === 'black' ? 'grey' : colorTheme.hexCode}
            />
          </View>
        ) : (
          <AntDesign
            name="home"
            size={25}
            style={{
              padding: 10,
            }}
            color={'black'}
          />
        );
      } else if (route.name === 'ViewDiary') {
        return focused ? (
          <View
            style={
              {
                // backgroundColor: colorTheme.hexCode,
                // padding: 10,
                // borderRadius: 10,
              }
            }>
            <SimpleLineIcons
              name="book-open"
              size={25}
              color={colorTheme.color === 'black' ? 'grey' : colorTheme.hexCode}
            />
          </View>
        ) : (
          <SimpleLineIcons
            name="book-open"
            size={25}
            style={{
              padding: 10,
            }}
            color={'black'}
          />
        );
      } else if (route.name === 'Todo') {
        return focused ? (
          <View
            style={
              {
                // backgroundColor: colorTheme.hexCode,
                // padding: 10,
                // borderRadius: 10,
              }
            }>
            <MaterialCommunityIcons
              name="format-list-checks"
              size={25}
              color={colorTheme.color === 'black' ? 'grey' : colorTheme.hexCode}
            />
          </View>
        ) : (
          <MaterialCommunityIcons
            name="format-list-checks"
            size={25}
            style={{
              padding: 10,
            }}
            color={'black'}
          />
        );
      } else if (route.name === 'RememberBook') {
        return focused ? (
          <View
            style={
              {
                // backgroundColor: colorTheme.hexCode,
                // padding: 10,
                // paddingHorizontal: 14,
                // borderRadius: 10,
              }
            }>
            <FontAwesome
              name="bookmark-o"
              size={25}
              color={colorTheme.color === 'black' ? 'grey' : colorTheme.hexCode}
            />
          </View>
        ) : (
          <FontAwesome
            name="bookmark-o"
            size={25}
            style={{
              padding: 10,
            }}
            color={'black'}
          />
        );
      } else if (route.name === 'MyPage') {
        return focused ? (
          <View
            style={
              {
                // backgroundColor: colorTheme.hexCode,
                // padding: 10,
                // borderRadius: 10,
              }
            }>
            <Ionicons
              name="person-outline"
              size={25}
              color={colorTheme.color === 'black' ? 'grey' : colorTheme.hexCode}
            />
          </View>
        ) : (
          <Ionicons
            name="person-outline"
            size={25}
            style={{
              padding: '10%',
            }}
            color={'black'}
          />
        );
      }
    },
    tabBarActiveTintColor: 'blue',
    tabBarInactiveTintColor: 'gray',
  });

  return (
    <Tab.Navigator initialRouteName="Main" screenOptions={tabScreenOptions}>
      <Tab.Screen name="Main" component={Main} />
      <Tab.Screen name="ViewDiary" component={ViewDiary} />
      <Tab.Screen name="Todo" component={Todo} />
      <Tab.Screen name="RememberBook" component={RememberBook} />
      <Tab.Screen name="MyPage" component={MyPage} />
    </Tab.Navigator>
  );
}

const tokenReissue = async () => {
  try {
    const res = await fetch(`http://${serverIP}:3003/jwtReissue`, {
      method: 'GET',
    });
    if (res.status === 200) {
      const data = await res.json();
      AsyncStorage.setItem('jwtToken', data.token);
      setUserAuthentication(true);
    } else if (res.status === 401) {
      const err = await res.json();
      throw err.error;
    }
  } catch (error) {
    console.log(error);
  }
};

const getToken = async setUserAuthentication => {
  const token = await AsyncStorage.getItem('jwtToken');
  // console.log('토큰', token);
  try {
    const res = await fetch(`http://${serverIP}:3003/jwtValidation`, {
      method: 'GET',
      headers: {
        token: token,
      },
    });
    if (res.status === 200) {
      setUserAuthentication(true);
    } else if (res.status === 401) {
      if (msg.error.name === 'TokenExpiredError') {
        tokenReissue(setUserAuthentication);
      } else {
        const msg = await res.json();
        throw msg.error;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

export default function App() {
  const [userAuthentication, setUserAuthentication] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(true);

  useEffect(() => {
    getToken(setUserAuthentication);
    SplashScreen.hide();
    setTimeout(() => {
      setLoadingVideo(false);
    }, 3000);
  }, []);

  {
    return (
      <GestureHandlerRootView style={{flex: 1}}>
        <ThemeProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName={userAuthentication ? 'MainPage' : 'Addinfo'}
              screenOptions={{headerShown: false}}>
              <Stack.Screen name="Addinfo" component={Addinfo} />
              <Stack.Screen name="MainPage" component={MainTab} />
              <Stack.Screen name="AddDiary" component={AddDiary} />
              <Stack.Screen name="ModifyDiary" component={ModifyDiary} />
              <Stack.Screen name="Viewall" component={Viewall} />
              <Stack.Screen name="ShowMore" component={ShowMore} />
            </Stack.Navigator>
          </NavigationContainer>
        </ThemeProvider>
      </GestureHandlerRootView>
    );
  }
}
