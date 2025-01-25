import { View, Text, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../routes/types';
import { CustomModal } from '../../components/Modal';
import { useEffect, useState } from 'react';
import { createSubGoals, getDb, initializeDatabase, removeSubGoals, updateChackSubGoals, updateSubGoals } from '../../database/initializeDatabase';
import { ScrollView } from 'react-native';
import { Checkbox } from 'react-native-paper';

type SubGoalsScreenRouteProp = RouteProp<RootStackParamList, 'SubGoals'>;
export type SubGoals = {
    title: string;
    goalsId: number;
    id: number;
    completed: boolean;
}

export default function SubGoalsScreen() {
    const route = useRoute<SubGoalsScreenRouteProp>();
    const { goalId, goalTitle } = route.params;
    const [subGoalsList, setSubGoalsList] = useState<SubGoals[]>([]);

    const [modalVisible, setModalVisible] = useState(false);
    const [editTitle, setEditTitle] = useState<string>('');
    const [editSubGoalId, setEditSubGoalId] = useState<number | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {

                await initializeDatabase();

                const db = getDb();

                const subGoals = await db.getAllAsync('SELECT * FROM subgoals WHERE goalsId = ?', [goalId]);
                setSubGoalsList(subGoals);
            } catch (error) {
                console.error("Erro ao abrir o banco de dados:", error);
            }
        };

        loadData()
    }, []);


    const handleSaveSubGoal = async (title: string) => {

        try {
            const newId = await createSubGoals(title, goalId);
            setSubGoalsList((prev) => [
                ...prev,
                {
                    id: newId,
                    title,
                    goalsId: goalId,
                    completed: false,
                },
            ]);
        } catch (error) {
            console.error("Erro ao criar Sub Meta:", error);
        }
    };

    const handleDeleteSubGoal = async (id: number) => {
        try {
            await removeSubGoals(id);
            setSubGoalsList((prev) => prev.filter((goal) => goal.id !== id));
        } catch (error) {
            console.error("Erro ao deletar Sub Meta:", error);
        }
    };

    const handleUpdateSubGoal = async (id: number, title: string) => {
        try {
            await updateSubGoals(id, title);
            setSubGoalsList((prev) => {
                return prev.map((subGoal) =>
                    subGoal.id === id ? { ...subGoal, title: title } : subGoal
                );
            });
            setEditSubGoalId(null); // Limpar a edição após salvar
            setEditTitle('');
            console.log('Sub Meta atualizada com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar a meta:', error);
        }
    };

    const handleEditSuboal = (id: number, title: string) => {
        setEditSubGoalId(id);
        setEditTitle(title);
        setModalVisible(true);
    };

    const handleCheckBoxChange = async (id: number, completed: boolean) => {
        try {
            await updateChackSubGoals(id, completed ? 0 : 1);
            setSubGoalsList((prev) =>
                prev.map((subGoal) =>
                    subGoal.id === id ? { ...subGoal, completed: !completed } : subGoal
                )
            );
        } catch (error) {
            console.error('Erro ao atualizar o status da submeta:', error);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 40, textAlign: 'center', marginBottom: 20, paddingTop: '20%', color: 'gray' }}>{goalTitle}</Text>
            <ScrollView showsVerticalScrollIndicator={false} >
                {subGoalsList.map((subGoal) => {
                    return (
                        <View
                            key={subGoal.id}
                            style={{
                                width: '95%',
                                margin: 10,
                                padding: 5,
                                borderWidth: 1,
                                borderColor: '#ccc',
                                borderRadius: 8,
                                backgroundColor: '#f9f9f9',
                            }}
                        >
                            <Checkbox
                                status={subGoal.completed ? 'checked' : 'unchecked'}
                                onPress={() => handleCheckBoxChange(subGoal.id, subGoal.completed)}
                                color="#007BFF"
                                uncheckedColor="gray"

                            />
                            <Text style={{ fontSize: 16, marginBottom: 8, justifyContent: 'center' }}>{subGoal.title}</Text>
                            <TouchableOpacity onPress={() => handleDeleteSubGoal(subGoal.id)}><Text>Apagar</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => handleEditSuboal(subGoal.id, subGoal.title)}><Text>Editar</Text></TouchableOpacity>
                        </View>
                    )
                })}
            </ScrollView >
            <TouchableOpacity
                style={{
                    width: 45,
                    height: 45,
                    backgroundColor: '#007BFF',
                    borderRadius: 100,
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'absolute',
                    bottom: 60,
                    right: 50,
                }}
                onPress={() => setModalVisible(true)}
            >
                <Text style={{ fontSize: 28, color: '#ffffff' }}>+</Text>
            </TouchableOpacity>
            <CustomModal
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    setEditSubGoalId(null);
                }}
                onSave={editSubGoalId !== null ? () => { handleUpdateSubGoal(editSubGoalId, editTitle) } : handleSaveSubGoal}
                title={editSubGoalId !== null ? "Editar Sub Meta" : "Nova Sub Meta"}
                placeholderInput={editSubGoalId !== null ? "Editar Sub Meta" : "Adicionar Sub Meta"}
                inputValue={editTitle}
                onInputChange={(text: string) => setEditTitle(text)}

            />
        </View >
    );
}
