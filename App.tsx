import React, { useState, useEffect } from "react";
import {
  FlatList,
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import { styles } from "./App.styles";

type Theme = "light" | "dark";

interface Match {
  id: string;
  matchday: number;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  stadium: string;
  city: string;
  homeGoals?: number | null;
  awayGoals?: number | null;
  status?: string | null;
}

const API_BASE_URL = "https://calciocalendarapi.onrender.com";
// const API_BASE_URL = "http://localhost:5073";

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>("dark");
  const [fixtures, setFixtures] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [teamSelectorVisible, setTeamSelectorVisible] = useState(false);

  const [selectedMatchday, setSelectedMatchday] = useState<number | null>(null);
  const [matchdaySelectorVisible, setMatchdaySelectorVisible] =
    useState(false);

  /** Vista attiva:
   * "ALL" → tutte
   * "FINISHED" → risultati
   * "SCHEDULED" → ancora da giocare
   */
  const [viewMode, setViewMode] = useState<"ALL" | "FINISHED" | "SCHEDULED">(
    "SCHEDULED"
  );

  const isDark = theme === "dark";

  // colori di tema
  const primaryColor = isDark ? "#66fcf1" : "#003366"; // stesso blu della scritta "Giornata" in light
  const textOnPrimary = isDark ? "#0b0c10" : "#ffffff";
  const leagueColor = isDark ? "#66fcf1" : "#006699";

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  //---------------- FETCH DATA ----------------//
  const loadFixtures = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/api/fixtures`);
      const data = (await res.json()) as Match[];
      setFixtures(data);
    } catch {
      setError("Errore nel caricamento");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFixtures();
  }, []);

  //---------------- LISTE ----------------//

  const teams = React.useMemo(() => {
    const s = new Set<string>();
    fixtures.forEach((f) => {
      s.add(f.homeTeam);
      s.add(f.awayTeam);
    });
    return Array.from(s).sort();
  }, [fixtures]);

  const matchdays = React.useMemo(() => {
    const s = new Set<number>();
    fixtures.forEach((f) => s.add(f.matchday));
    return Array.from(s).sort((a, b) => a - b);
  }, [fixtures]);

  //---------------- FILTRI PRINCIPALI ----------------//

  const visibleFixtures = React.useMemo(() => {
    let arr = [...fixtures];

    // Ordine normale (dal primo al 38)
    arr.sort((a, b) =>
      `${a.matchday} ${a.date} ${a.time}`.localeCompare(
        `${b.matchday} ${b.date} ${b.time}`
      )
    );

    // Se sto mostrando solo i risultati → inverti l’ordine (ultima giornata → prima)
    if (viewMode === "FINISHED") {
      arr.reverse();
    }

    // vista risultati
    if (viewMode === "FINISHED") {
      arr = arr.filter((f) => f.status === "FINISHED");
    }

    // vista partite future
    if (viewMode === "SCHEDULED") {
      arr = arr.filter((f) => f.status === "SCHEDULED");
    }

    // filtro squadra
    if (selectedTeam) {
      arr = arr.filter(
        (f) => f.homeTeam === selectedTeam || f.awayTeam === selectedTeam
      );
    }

    // filtro giornata
    if (selectedMatchday !== null) {
      arr = arr.filter((f) => f.matchday === selectedMatchday);
    }

    return arr;
  }, [fixtures, selectedTeam, selectedMatchday, viewMode]);

  //---------------- RENDER DI UNA PARTITA ----------------//

  const renderMatch = ({ item, index }: { item: Match; index: number }) => {
    const prev = visibleFixtures[index - 1];
    const showDivider = !prev || prev.matchday !== item.matchday;

    const hasResult = item.homeGoals != null && item.awayGoals != null;

    return (
      <View>
        {showDivider && (
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: primaryColor,
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            —— Giornata {item.matchday} ——
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
              {
                color: leagueColor,
              },
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
            {item.homeTeam}
            {hasResult
              ? ` ${item.homeGoals} - ${item.awayGoals} `
              : " vs "}
            {item.awayTeam}
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
            {item.stadium} • {item.city}
          </Text>
        </View>
      </View>
    );
  };

  //---------------- UI STATES ----------------//

  if (loading)
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" />
        <Text style={{ color: "#fff", marginTop: 10 }}>Caricamento...</Text>
      </SafeAreaView>
    );

  if (error)
    return (
      <SafeAreaView style={styles.loading}>
        <Text style={{ color: "red", marginBottom: 20 }}>{error}</Text>
        <TouchableOpacity onPress={loadFixtures}>
          <Text style={{ color: primaryColor }}>Riprova</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );

  //---------------- MAIN RENDER ----------------//

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#0b0c10" : "#f2f2f2" },
      ]}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            { color: isDark ? "#ffffff" : "#000000" },
          ]}
        >
          Calcio Calendar – Serie A 2025/26
        </Text>

        {/* FILTRI */}
        <View style={styles.headerFiltersRow}>
          <TouchableOpacity
            style={[styles.filterButton, { borderColor: primaryColor }]}
            onPress={() => setMatchdaySelectorVisible(true)}
          >
            <Text style={{ color: primaryColor }}>
              {selectedMatchday !== null
                ? `Giornata ${selectedMatchday}`
                : "Tutte le giornate"}{" "}
              ▾
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              { borderColor: primaryColor, marginLeft: 6 },
            ]}
            onPress={() => setTeamSelectorVisible(true)}
          >
            <Text style={{ color: primaryColor }}>
              {selectedTeam || "Tutte le squadre"} ▾
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleTheme} style={{ marginLeft: 8 }}>
            <Text style={{ fontSize: 22 }}>{isDark ? "☀️" : "🌙"}</Text>
          </TouchableOpacity>
        </View>

        {/* VISTA RISULTATI / FUTURE / TUTTO */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 14,
            gap: 10,
          }}
        >
          <TouchableOpacity
            style={[
              styles.viewButton,
              { borderColor: primaryColor },
              viewMode === "FINISHED" && { backgroundColor: primaryColor },
            ]}
            onPress={() => setViewMode("FINISHED")}
          >
            <Text
              style={[
                styles.viewButtonText,
                { color: primaryColor },
                viewMode === "FINISHED" && { color: textOnPrimary },
              ]}
            >
              Risultati
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.viewButton,
              { borderColor: primaryColor },
              viewMode === "SCHEDULED" && { backgroundColor: primaryColor },
            ]}
            onPress={() => setViewMode("SCHEDULED")}
          >
            <Text
              style={[
                styles.viewButtonText,
                { color: primaryColor },
                viewMode === "SCHEDULED" && { color: textOnPrimary },
              ]}
            >
              In programma
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.viewButton,
              { borderColor: primaryColor },
              viewMode === "ALL" && { backgroundColor: primaryColor },
            ]}
            onPress={() => setViewMode("ALL")}
          >
            <Text
              style={[
                styles.viewButtonText,
                { color: primaryColor },
                viewMode === "ALL" && { color: textOnPrimary },
              ]}
            >
              Mostra tutto
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* LISTA PARTITE */}
      <FlatList
        data={visibleFixtures}
        keyExtractor={(i) => i.id}
        renderItem={renderMatch}
        contentContainerStyle={styles.listContent}
      />

      {/* -------- MODALI -------- */}

      {/* GIORNATE */}
      <Modal
        visible={matchdaySelectorVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMatchdaySelectorVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleziona giornata</Text>

            <ScrollView style={{ maxHeight: 280 }}>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedMatchday(null);
                  setMatchdaySelectorVisible(false);
                }}
              >
                <Text
                  style={{
                    color: primaryColor,
                    fontWeight: selectedMatchday === null ? "700" : "400",
                  }}
                >
                  Tutte le giornate
                </Text>
              </TouchableOpacity>

              {matchdays.map((md) => (
                <TouchableOpacity
                  key={md}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedMatchday(md);
                    setMatchdaySelectorVisible(false);
                  }}
                >
                  <Text
                    style={{
                      color: "#ffffff",
                      fontWeight: selectedMatchday === md ? "700" : "400",
                    }}
                  >
                    Giornata {md}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setMatchdaySelectorVisible(false)}
            >
              <Text style={{ color: primaryColor }}>Chiudi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SQUADRE */}
      <Modal
        visible={teamSelectorVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTeamSelectorVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleziona squadra</Text>

            <ScrollView style={{ maxHeight: 280 }}>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedTeam(null);
                  setTeamSelectorVisible(false);
                }}
              >
                <Text
                  style={{
                    color: primaryColor,
                    fontWeight: !selectedTeam ? "700" : "400",
                  }}
                >
                  Tutte le squadre
                </Text>
              </TouchableOpacity>

              {teams.map((team) => (
                <TouchableOpacity
                  key={team}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedTeam(team);
                    setTeamSelectorVisible(false);
                  }}
                >
                  <Text
                    style={{
                      color: "#ffffff",
                      fontWeight: selectedTeam === team ? "700" : "400",
                    }}
                  >
                    {team}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setTeamSelectorVisible(false)}
            >
              <Text style={{ color: primaryColor }}>Chiudi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default App;
