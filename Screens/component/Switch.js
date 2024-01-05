import {Switch, View, Platform} from 'react-native';
import {useContext} from 'react';
import {ThemeContext} from '../Context/ThemeContext';

const MySwitch = ({onValueChange, value}) => {
  const {colorTheme, setColorTheme} = useContext(ThemeContext);
  return (
    <View
      style={{
        transform:
          Platform.OS === 'ios' ? [{scaleX: 0.8}, {scaleY: 0.8}] : [{scale: 1}],
      }}>
      <Switch
        trackColor={{false: 'lightgrey', true: colorTheme.hexCode2}}
        thumbColor={
          value
            ? colorTheme.color === 'black'
              ? 'white'
              : 'white'
            : colorTheme.hexCode2
        }
        ios_backgroundColor="white"
        onValueChange={onValueChange}
        value={value}
      />
    </View>
  );
};

export default MySwitch;
