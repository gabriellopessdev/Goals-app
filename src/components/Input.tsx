import { TextInput, TextInputProps } from "react-native";

export default function Input({ ...rest }: TextInputProps) {
    return <TextInput {...rest}
        style={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            padding: 10,
            marginBottom: 20,
        }} />
}