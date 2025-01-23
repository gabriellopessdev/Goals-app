import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { CustomModal } from "./components/Modal";
import { create, getDb, initializeDatabase } from "./database/initializeDatabase";

export default function App() {
  const [goalsList, setGoalsList] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // Função assíncrona dentro do useEffect
    const loadData = async () => {
      try {
        // Abrir o banco de dados ao iniciar o aplicativo
        await initializeDatabase();

        const db = getDb();

        const allRows = await db.getAllAsync('SELECT * FROM goals');
        const titles = allRows.map((row: { title: string }) => row.title);
        setGoalsList(titles);
      } catch (error) {
        console.error("Erro ao abrir o banco de dados:", error);
      }
    };

    loadData(); // Chamando a função assíncrona
  }, []);

  const handleSaveGoal = (title: string) => {
    create(title)
    setGoalsList((prevGoalsList) => [...prevGoalsList, title]);
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
            <View key={index} style={{ width: '95%', margin: 10, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#f9f9f9', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, textAlign: 'center' }}>{item}</Text>
            </View>
          )
        })}
      </ScrollView>
      <TouchableOpacity
        style={{
          width: 45,
          height: 45,
          backgroundColor: `#007BFF`,
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
        onClose={() => setModalVisible(false)}
        onSave={handleSaveGoal}
        title="Nova Meta"
        placeholderInput="Adicionar meta"
      />
    </View>
  )
}