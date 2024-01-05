import React, {forwardRef, useImperativeHandle} from 'react';
import {View, Animated} from 'react-native';

const VibrationComponent = forwardRef((props, ref) => {
  const {style, children} = props;
  const vibrationValue = new Animated.Value(0);

  const startVibration = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(vibrationValue, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(vibrationValue, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
      ]),
      {iterations: 5},
    ).start(() => vibrationValue.setValue(0));
  };

  useImperativeHandle(ref, () => ({
    startVibration,
  }));

  return (
    <Animated.View
      style={[
        {
          transform: [{translateX: vibrationValue}],
        },
        style, // 사용자 정의 스타일 추가
      ]}>
      {children}
    </Animated.View>
  );
});

export default VibrationComponent;
