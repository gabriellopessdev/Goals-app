import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View, ScrollView, Alert } from "react-native";
import { createGoals, getDb, initializeDatabase, removeGoals, updateGoals } from "../../database/initializeDatabase";
import { CustomModal } from '../../components/Modal';


type Goals = {
    title: string;
    progress: number;
    id: number
}

export default function GoalsScreen() {
    const [goalsList, setGoalsList] = useState<Goals[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editTitle, setEditTitle] = useState<string>('');
    const [editGoalId, setEditGoalId] = useState<number | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                await initializeDatabase();

                const db = getDb();

                const allGoals = await db.getAllAsync('SELECT * FROM goals');
                const formattedGoals = allGoals.map((goal: Goals) => ({
                    id: goal.id,
                    title: goal.title,

                    progress: Math.random() * 100, // Simulando progresso entre 0 e 100 mudar depois para as submetas
                }));
                setGoalsList(formattedGoals);
            } catch (error) {
                console.error("Erro ao abrir o banco de dados:", error);
            }
        };

        loadData();
    }, []);

    const handleSaveGoal = async (title: string) => {
        if (!title.trim()) {
            Alert.alert("Erro", "O título da meta não pode estar vazio.");
            return;
        }

        try {
            await createGoals(title);
            setGoalsList((prev) => [
                ...prev,
                {
                    id: Date.now(), // Temporário até carregar do banco
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

    return (
        <View style={{ flex: 1 }}>
            <StatusBar style="auto" />
            <Text style={{ fontSize: 40, textAlign: 'center', marginBottom: 20, paddingTop: '20%', color: 'gray' }}>
                METAS 2025
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} >
                {goalsList.map((item, index) => {
                    return (
                        <View
                            key={index}
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
                            <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 8 }}>{item.title}</Text>
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
                                        width: `${item.progress}%`,
                                        height: '100%',
                                        backgroundColor: '#007BFF',
                                    }}
                                />
                            </View>
                            <Text style={{ fontSize: 12, textAlign: 'center', marginTop: 5, color: 'gray' }}>
                                {Math.round(item.progress)}% concluído
                            </Text>
                            <TouchableOpacity onPress={() => handleDeleteGoal(item.id)}><Text>Apagar</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => handleEditGoal(item.id, item.title)}><Text>Editar</Text></TouchableOpacity>
                        </View>
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
