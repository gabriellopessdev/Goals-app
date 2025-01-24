import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GoalsScreen from "./screens/Goals"; // Importando a tela
import SubGoalsScreen from "./screens/Subgoals";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator>
        <Stack.Screen name="Goals" component={GoalsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SubGoals" component={SubGoalsScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}