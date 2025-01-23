import { Modal, Text } from "react-native";
import { View } from 'react-native';
import { TouchableOpacity } from 'react-native';
import Input from "./Input";
import { useState } from 'react';

interface modalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (goal: string) => void;
    title?: string;
    placeholderInput?: string;
}

export function CustomModal({ visible, onClose, onSave, title, placeholderInput }: modalProps) {
    const [goal, setGoal] = useState('');

    const handleSave = () => {
        if (goal.trim()) {
            onSave(goal); // Passa o título para o componente pai
            setGoal('');
            onClose(); // Fecha o modal
        }
    };
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }}>
                <View
                    style={{
                        width: '80%',
                        backgroundColor: '#fff',
                        borderRadius: 12,
                        padding: 20,
                        shadowColor: '#000',
                        shadowOpacity: 0.25,
                        shadowRadius: 4,
                        elevation: 5,
                    }}
                >
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>{title}</Text>
                    <Input
                        placeholder={placeholderInput}
                        value={goal}
                        onChangeText={setGoal}
                    />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <TouchableOpacity
                            style={{
                                backgroundColor: '#28a745',
                                paddingVertical: 10,
                                paddingHorizontal: 20,
                                borderRadius: 8,
                            }}
                            onPress={handleSave}
                        >
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Salvar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                backgroundColor: '#dc3545',
                                paddingVertical: 10,
                                paddingHorizontal: 20,
                                borderRadius: 8,
                            }}
                            onPress={onClose}
                        >
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}