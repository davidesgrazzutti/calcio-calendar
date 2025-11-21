import React, { useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";

type Theme = "light" | "dark";

interface Match {
  id: string;
  date: string;   // YYYY-MM-DD
  time: string;   // HH:mm
  homeTeam: string;
  awayTeam: string;
  venue: string;
  city: string;
}

// 📅 Prossimi incontri Serie A (snapshot statico, aggiornato al calendario attuale)
const SERIE_A_FIXTURES: Match[] = [
  // Sabato 22 novembre 2025
  {
    id: "2025-11-22-CAG-GEN",
    date: "2025-11-22",
    time: "14:00",
    homeTeam: "Cagliari",
    awayTeam: "Genoa",
    venue: "Unipol Domus",
    city: "Cagliari",
  },
  {
    id: "2025-11-22-UDI-BOL",
    date: "2025-11-22",
    time: "14:00",
    homeTeam: "Udinese",
    awayTeam: "Bologna",
    venue: "Bluenergy Stadium",
    city: "Udine",
  },
  {
    id: "2025-11-22-FIO-JUV",
    date: "2025-11-22",
    time: "17:00",
    homeTeam: "Fiorentina",
    awayTeam: "Juventus",
    venue: "Artemio Franchi",
    city: "Firenze",
  },
  {
    id: "2025-11-22-NAP-ATA",
    date: "2025-11-22",
    time: "19:45",
    homeTeam: "Napoli",
    awayTeam: "Atalanta",
    venue: "Diego Armando Maradona",
    city: "Napoli",
  },

  // Domenica 23 novembre 2025
  {
    id: "2025-11-23-VER-PAR",
    date: "2025-11-23",
    time: "11:30",
    homeTeam: "Hellas Verona",
    awayTeam: "Parma",
    venue: "Stadio Marcantonio Bentegodi",
    city: "Verona",
  },
  {
    id: "2025-11-23-CRE-ROM",
    date: "2025-11-23",
    time: "14:00",
    homeTeam: "Cremonese",
    awayTeam: "Roma",
    venue: "Giovanni Zini",
    city: "Cremona",
  },
  {
    id: "2025-11-23-LAZ-LEC",
    date: "2025-11-23",
    time: "17:00",
    homeTeam: "Lazio",
    awayTeam: "Lecce",
    venue: "Stadio Olimpico",
    city: "Roma",
  },
  {
    id: "2025-11-23-INT-MIL",
    date: "2025-11-23",
    time: "19:45",
    homeTeam: "Inter",
    awayTeam: "AC Milan",
    venue: "Stadio Giuseppe Meazza",
    city: "Milano",
  },

  // Lunedì 24 novembre 2025
  {
    id: "2025-11-24-TOR-COM",
    date: "2025-11-24",
    time: "17:30",
    homeTeam: "Torino",
    awayTeam: "Como",
    venue: "Olimpico Grande Torino",
    city: "Torino",
  },
  {
    id: "2025-11-24-SAS-PIS",
    date: "2025-11-24",
    time: "19:45",
    homeTeam: "Sassuolo",
    awayTeam: "Pisa",
    venue: "MAPEI Stadium - Città del Tricolore",
    city: "Reggio Emilia",
  },

  // Venerdì 28 novembre 2025
  {
    id: "2025-11-28-COM-SAS",
    date: "2025-11-28",
    time: "19:45",
    homeTeam: "Como",
    awayTeam: "Sassuolo",
    venue: "Giuseppe Sinigaglia",
    city: "Como",
  },
];

// Ordiniamo in caso
const SORTED_FIXTURES = [...SERIE_A_FIXTURES].sort((a, b) =>
  `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
);

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>("dark");
  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const renderMatch = ({ item }: { item: Match }) => {
    return (
      <View
        style={[
          styles.card,
          { backgroundColor: isDark ? "#1f2833" : "#ffffff" },
        ]}
      >
        <Text
          style={[
            styles.league,
            { color: isDark ? "#66fcf1" : "#006699" },
          ]}
        >
          Serie A
        </Text>

        <Text
          style={[
            styles.teams,
            { color: isDark ? "#ffffff" : "#000000" },
          ]}
        >
          {item.homeTeam} vs {item.awayTeam}
        </Text>

        <Text
          style={[
            styles.dateTime,
            { color: isDark ? "#c5c6c7" : "#333333" },
          ]}
        >
          {item.date} • {item.time}
        </Text>

        <Text
          style={[
            styles.meta,
            { color: isDark ? "#c5c6c7" : "#555555" },
          ]}
        >
          {item.venue} • {item.city}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#0b0c10" : "#f2f2f2" },
      ]}
    >
      {/* HEADER: titolo + toggle sotto a sinistra */}
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            { color: isDark ? "#ffffff" : "#000000" },
          ]}
        >
          Risultati Calcio – Prossimi incontri Serie A
        </Text>

        <TouchableOpacity
          onPress={toggleTheme}
          style={styles.themeButton}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 22 }}>
            {isDark ? "☀️" : "🌙"}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={SORTED_FIXTURES}
        keyExtractor={(item) => item.id}
        renderItem={renderMatch}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 32 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,     // ⬅️ aumentato (prima era 16)
    paddingBottom: 8,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  themeButton: {
    marginTop: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  card: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  league: {
    fontSize: 12,
    marginBottom: 4,
  },
  teams: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  dateTime: {
    fontSize: 12,
    marginBottom: 2,
  },
  meta: {
    fontSize: 12,
  },
});

export default App;
