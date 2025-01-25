import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View, ScrollView, Alert } from "react-native";
import { createGoals, getDb, initializeDatabase, removeGoals, updateGoals } from "../../database/initializeDatabase";
import { CustomModal } from '../../components/Modal';
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../routes/types";
import { SubGoals } from "../Subgoals";


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
        } catch (error) {
            console.error("Erro ao deletar meta:", error);
        }
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

    return (
        <View style={{ flex: 1 }}>
            <StatusBar style="auto" />
            <Text style={{ fontSize: 40, textAlign: 'center', marginBottom: 20, paddingTop: '20%', color: 'gray' }}>
                METAS 2025
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} >
                {goalsList.map((goal) => {
                    return (
                        <TouchableOpacity onPress={() => handleViewSubGoals(goal.id, goal.title)}>
                            <View
                                key={goal.id}
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
                                <TouchableOpacity onPress={() => handleDeleteGoal(goal.id)}><Text>Apagar</Text></TouchableOpacity>
                                <TouchableOpacity onPress={() => handleEditGoal(goal.id, goal.title)}><Text>Editar</Text></TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    )
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
                onSave={editGoalId !== null ? () => { handleUpdateGoal(editGoalId, editTitle) } : handleSaveGoal}
                title={editGoalId !== null ? "Editar Meta" : "Nova Meta"}
                placeholderInput={editGoalId !== null ? "Editar Meta" : "Adicionar Meta"}
                inputValue={editTitle}
                onInputChange={(text: string) => setEditTitle(text)}

            />
        </View>
    );
}
