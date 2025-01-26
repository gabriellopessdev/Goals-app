import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Text, TouchableOpacity, View, ScrollView, Alert, Modal, Animated } from "react-native";
import { createGoals, getDb, initializeDatabase, removeGoals, updateGoals } from "../../database/initializeDatabase";
import { CustomModal } from '../../components/Modal';
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../routes/types";
import { SubGoals } from "../Subgoals";
import { IconButton } from "react-native-paper";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";


export type Goals = {
    title: string;
    progress: number;
    id: number
}

export default function GoalsScreen() {
    const [goalsList, setGoalsList] = useState<Goals[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editTitle, setEditTitle] = useState<string>('');
    const [editGoalId, setEditGoalId] = useState<number | null>(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [goalToDelete, setGoalToDelete] = useState<number | null>(null);


    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Goals'>>();

    useFocusEffect(
        React.useCallback(() => {
            const loadData = async () => {
                try {
                    await initializeDatabase();

                    const db = getDb();

                    const allGoals = await db.getAllAsync('SELECT * FROM goals');

                    const allSubGoals = await db.getAllAsync('SELECT * FROM subgoals');

                    // Calcular o progresso para cada meta
                    const formattedGoals = allGoals.map((goal: Goals) => {
                        // Filtrar submetas associadas à meta atual
                        const relatedSubGoals = allSubGoals.filter(
                            (subGoal: SubGoals) => subGoal.goalsId === goal.id
                        );

                        // Total de submetas
                        const totalSubGoals = relatedSubGoals.length;

                        // Submetas concluídas
                        const completedSubGoals = relatedSubGoals.filter(
                            (subGoal: SubGoals) => subGoal.completed
                        ).length;

                        // Calcular progresso (evitar divisão por zero)
                        const progress =
                            totalSubGoals > 0
                                ? (completedSubGoals / totalSubGoals) * 100
                                : 0;

                        return {
                            id: goal.id,
                            title: goal.title,
                            progress, // Progresso calculado
                        };
                    });
                    setGoalsList(formattedGoals);
                } catch (error) {
                    console.error("Erro ao abrir o banco de dados:", error);
                }
            };

            loadData();
        }, [])
    );

    const handleSaveGoal = async (title: string) => {
        if (!title.trim()) {
            Alert.alert("Erro", "O título da meta não pode estar vazio.");
            return;
        }

        try {
            const newId = await createGoals(title);
            setGoalsList((prev) => [
                ...prev,
                {
                    id: newId,
                    title,
                    progress: 0,
                },
            ]);
        } catch (error) {
            console.error("Erro ao criar meta:", error);
        }
    };

    const handleDeleteGoal = async (id: number) => {
        try {
            await removeGoals(id);
            setGoalsList((prev) => prev.filter((goal) => goal.id !== id));
            setDeleteModalVisible(false);
        } catch (error) {
            console.error("Erro ao deletar meta:", error);
        }
    };

    const cancelDeleteGoal = () => {
        setDeleteModalVisible(false); // Fecha o modal sem realizar a exclusão
    };

    const openDeleteGoalModal = (id: number) => {
        setGoalToDelete(id); // Guarda o ID da meta que será deletada
        setDeleteModalVisible(true); // Abre o modal
    };

    const handleUpdateGoal = async (id: number, title: string) => {
        try {
            await updateGoals(id, title);
            setGoalsList((prev) => {
                return prev.map((goal) =>
                    goal.id === id ? { ...goal, title: title } : goal
                );
            });
            setEditGoalId(null); // Limpar a edição após salvar
            setEditTitle('');
            console.log('Meta atualizada com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar a meta:', error);
        }
    };

    const handleEditGoal = (id: number, title: string) => {
        setEditGoalId(id);
        setEditTitle(title);
        setModalVisible(true);
    };

    const handleViewSubGoals = (goalId: number, goalTitle: string) => {
        navigation.navigate("SubGoals", { goalId, goalTitle }); // Passa o id e o título da meta
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
                    onPress={() => handleEditGoal(id, title)}
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
                    onPress={() => openDeleteGoalModal(id)}
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
                <StatusBar style="auto" />
                <Text style={{ fontSize: 40, textAlign: 'center', marginBottom: 20, paddingTop: '20%', color: 'gray' }}>
                    METAS 2025
                </Text>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {goalsList.map((goal) => {
                        return (
                            <TouchableOpacity key={goal.id} onPress={() => handleViewSubGoals(goal.id, goal.title)}>
                                <View
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
                                    <Swipeable
                                        renderRightActions={(progress) => renderRightActions(goal.id, goal.title, progress)}
                                        overshootLeft={false}
                                        overshootRight={false}
                                        friction={2}
                                    >
                                        <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 8 }}>{goal.title}</Text>
                                        {/* Barra de progresso */}
                                        <View
                                            style={{
                                                width: '100%',
                                                height: 8,
                                                backgroundColor: '#e0e0e0',
                                                borderRadius: 4,
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <View
                                                style={{
                                                    width: `${goal.progress}%`,
                                                    height: '100%',
                                                    backgroundColor: '#007BFF',
                                                }}
                                            />
                                        </View>
                                        <Text style={{ fontSize: 12, textAlign: 'center', marginTop: 5, color: 'gray' }}>
                                            {Math.round(goal.progress)}% concluído
                                        </Text>
                                    </Swipeable>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

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
                        setEditGoalId(null);
                    }}
                    onSave={editGoalId !== null ? () => handleUpdateGoal(editGoalId, editTitle) : handleSaveGoal}
                    title={editGoalId !== null ? "Editar Meta" : "Nova Meta"}
                    placeholderInput={editGoalId !== null ? "Editar Meta" : "Adicionar Meta"}
                    inputValue={editTitle}
                    onInputChange={(text: string) => setEditTitle(text)}
                />

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
                                        onPress={() => goalToDelete && handleDeleteGoal(goalToDelete)}
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
            </View>
        </GestureHandlerRootView>
    );
}