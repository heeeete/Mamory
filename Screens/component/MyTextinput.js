import {TextInput} from 'react-native-paper';

function MyTextinput({
  value,
  label,
  onChangeText,
  onSubmitEditing,
  style,
  mode,
  multiline,
}) {
  return (
    <TextInput
      value={value}
      returnKeyType="done"
      onChangeText={onChangeText}
      style={[
        {
          backgroundColor: 'white',
          marginHorizontal: 50,
          height: 40,
          marginTop: '5%',
          marginBottom: '5%',
          label,
        },
        style, // 이 부분에 추가된 사용자 지정 스타일이 적용됩니다.
      ]}
      label={label}
      mode={mode ? mode : 'outlined'}
      onSubmitEditing={onSubmitEditing}
      multiline={multiline ? multiline : false}></TextInput>
  );
}

export default MyTextinput;
