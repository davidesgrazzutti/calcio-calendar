import React, { useState, useEffect } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

type Theme = "light" | "dark";

interface Match {
  id: string;
  matchday: number;
  date: string;   // YYYY-MM-DD
  time: string;   // HH:mm
  homeTeam: string;
  awayTeam: string;
  venue: string;
  city: string;
}

// ⬇️ URL della tua API su Render
const API_BASE_URL = "https://calciocalendarapi.onrender.com";

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>("dark");
  const [fixtures, setFixtures] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const loadFixtures = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/api/fixtures`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = (await res.json()) as Match[];

      // ordina per giornata + data + ora
      const sorted = [...data].sort((a, b) =>
        `${a.matchday.toString().padStart(2, "0")} ${a.date} ${a.time}`.localeCompare(
          `${b.matchday.toString().padStart(2, "0")} ${b.date} ${b.time}`
        )
      );

      setFixtures(sorted);
    } catch (err: any) {
      console.log("Errore nel fetch:", err);
      setError("Impossibile caricare le partite. Controlla la connessione.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFixtures();
  }, []);

  const renderMatch = ({ item, index }: { item: Match; index: number }) => {
    const prev = fixtures[index - 1];
    const showDivider = index === 0 || prev.matchday !== item.matchday;

    return (
      <View>
        {showDivider && (
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: isDark ? "#66fcf1" : "#003366",
              marginTop: 20,
              marginBottom: 10,
              textAlign: "center",
            }}
          >
            ———  Giornata {item.matchday}  ———
          </Text>
        )}

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
            Serie A 2025/26
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
      </View>
    );
  };

  // schermata di loading
  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: isDark ? "#0b0c10" : "#f2f2f2" },
        ]}
      >
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
        <Text
          style={{
            marginTop: 16,
            textAlign: "center",
            color: isDark ? "#ffffff" : "#000000",
          }}
        >
          Caricamento partite...
        </Text>
      </SafeAreaView>
    );
  }

  // schermata di errore
  if (error) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: isDark ? "#0b0c10" : "#f2f2f2" },
        ]}
      >
        <Text
          style={{
            margin: 16,
            textAlign: "center",
            color: isDark ? "#ff6666" : "#cc0000",
          }}
        >
          {error}
        </Text>

        <TouchableOpacity
          onPress={loadFixtures}
          style={{
            alignSelf: "center",
            marginTop: 10,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: isDark ? "#66fcf1" : "#006699",
          }}
        >
          <Text style={{ color: isDark ? "#66fcf1" : "#006699" }}>
            Riprova
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // schermata normale
  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#0b0c10" : "#f2f2f2" },
      ]}
    >
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            { color: isDark ? "#ffffff" : "#000000" },
          ]}
        >
          Calcio Calendar – Serie A 2025/26
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
        data={fixtures}
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
    paddingTop: 60,
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
