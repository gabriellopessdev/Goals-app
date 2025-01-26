import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../routes/types';
import { CustomModal } from '../../components/Modal';
import { useEffect, useState } from 'react';
import { createSubGoals, getDb, initializeDatabase, removeSubGoals, updateChackSubGoals, updateSubGoals } from '../../database/initializeDatabase';
import { ScrollView } from 'react-native';
import { Checkbox, IconButton } from 'react-native-paper';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

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
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [subGoalToDelete, setSubGoalToDelete] = useState<number | null>(null);

    const translateX = useState(new Animated.Value(100))[0];

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
            setEditSubGoalId(null);
            setEditTitle('');
            console.log('Sub Meta atualizada com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar a meta:', error);
        }
    };

    const handleEditSubGoal = (id: number, title: string) => {
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

    const cancelDeleteGoal = () => {
        setDeleteModalVisible(false); // Fecha o modal sem realizar a exclusão
    };

    const openDeleteSubGoalModal = (id: number) => {
        setSubGoalToDelete(id); // Guarda o ID da meta que será deletada
        setDeleteModalVisible(true); // Abre o modal
    };

    const renderRightActions = (
        id: number,
        title: string,
        progress: Animated.AnimatedInterpolation<number>
    ) => {
        // Interpolar o progresso para determinar a translação em X
        const translateX = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [100, 0], // Começa com 100 (escondido) e vai para 0 (totalmente visível)
        });

        return (
            <Animated.View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    transform: [{ translateX }], // Aqui aplicamos a interpolação corretamente
                }}
            >
                <TouchableOpacity
                    onPress={() => handleEditSubGoal(id, title)}
                    style={{
                        width: 50,
                        height: "100%",
                        backgroundColor: "green",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <IconButton icon="pencil" size={24} iconColor="#ffffff" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => openDeleteSubGoalModal(id)}
                    style={{
                        width: 50,
                        height: "100%",
                        backgroundColor: "red",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <IconButton icon="trash-can" size={24} iconColor="#ffffff" />
                </TouchableOpacity>
            </Animated.View>
        );
    };


    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
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
                                    position: 'relative',
                                }}
                            >

                                <Swipeable
                                    renderRightActions={(progress) => renderRightActions(subGoal.id, subGoal.title, progress)}
                                    overshootLeft={false} // Impede o overshoot no lado esquerdo
                                    overshootRight={false} // Impede o overshoot no lado direito
                                    friction={2} // Aumenta a fricção para limitar o movimento (quanto maior, mais difícil arrastar)
                                >
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Checkbox
                                            status={subGoal.completed ? 'checked' : 'unchecked'}
                                            onPress={() => handleCheckBoxChange(subGoal.id, subGoal.completed)}
                                            color="#007BFF"
                                            uncheckedColor="gray"
                                        />
                                        <Text style={{ fontSize: 16, justifyContent: 'center' }}>{subGoal.title}</Text>
                                    </View>
                                </Swipeable>
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

            {deleteModalVisible && (
                <Modal
                    visible={deleteModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={cancelDeleteGoal}
                >
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fundo escuro para o modal
                        }}
                    >
                        <View
                            style={{
                                width: 300,
                                padding: 20,
                                backgroundColor: 'white',
                                borderRadius: 10,
                            }}
                        >
                            <Text style={{ marginBottom: 20 }}>Tem certeza que deseja excluir esta meta?</Text>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: '#dc3545',
                                        paddingVertical: 10,
                                        paddingHorizontal: 20,
                                        borderRadius: 8,
                                    }}
                                    onPress={() => subGoalToDelete && handleDeleteSubGoal(subGoalToDelete)}
                                >
                                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Excluir</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: 'gray',
                                        paddingVertical: 10,
                                        paddingHorizontal: 20,
                                        borderRadius: 8,
                                    }}
                                    onPress={cancelDeleteGoal}
                                >
                                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Cancelar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
        </GestureHandlerRootView >
    );
}
