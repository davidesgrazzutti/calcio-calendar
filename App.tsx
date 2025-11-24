import React, { useState, useEffect } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";

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
  const primaryColor = isDark ? "#66fcf1" : "#003366";
  const textOnPrimary = isDark ? "#0b0c10" : "#ffffff";

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

    const hasResult =
      item.homeGoals != null && item.awayGoals != null;

    return (
      <View>
        {showDivider && (
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: isDark ? "#66fcf1" : "#003366",
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
        <Text style={{ color: "#fff", marginTop: 10 }}>
          Caricamento...
        </Text>
      </SafeAreaView>
    );

  if (error)
    return (
      <SafeAreaView style={styles.loading}>
        <Text style={{ color: "red", marginBottom: 20 }}>{error}</Text>
        <TouchableOpacity onPress={loadFixtures}>
          <Text style={{ color: "#66fcf1" }}>Riprova</Text>
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
            { color: isDark ? "#fff" : "#000" },
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
            : "Tutte le giornate"} ▾
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.filterButton, { borderColor: primaryColor, marginLeft: 6 }]}
        onPress={() => setTeamSelectorVisible(true)}
      >
        <Text style={{ color: primaryColor }}>
          {selectedTeam || "Tutte le squadre"} ▾
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={toggleTheme}
        style={{ marginLeft: 8 }}
      >
        <Text style={{ fontSize: 22 }}>
          {isDark ? "☀️" : "🌙"}
        </Text>
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
                    color: "#66fcf1",
                    fontWeight:
                      selectedMatchday === null ? "700" : "400",
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
                      color: "#fff",
                      fontWeight:
                        selectedMatchday === md ? "700" : "400",
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
              <Text style={{ color: "#66fcf1" }}>Chiudi</Text>
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
                    color: "#66fcf1",
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
                      color: "#fff",
                      fontWeight:
                        selectedTeam === team ? "700" : "400",
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
              <Text style={{ color: "#66fcf1" }}>Chiudi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

/* ----------------- STILI ------------------ */

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: {
    flex: 1,
    backgroundColor: "#0b0c10",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  headerFiltersRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  filterButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },

  /* ---------- BOTTONI VISTA ---------- */
  viewButton: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      marginRight: 8,
      minWidth: 60,              // 👈 larghezza minima uguale per tutti
      alignItems: "center",       // 👈 testo centrato
  },
  viewButtonActiveText: {
     color: "#000", // testo nero quando attivo
  },
  viewButtonText: {
      fontSize: 14,
      fontWeight: "600",
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
    fontWeight: "700",
    marginBottom: 4,
  },
  dateTime: {
    fontSize: 12,
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: "#1f2833",
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
  },
  modalItem: {
    paddingVertical: 8,
  },
  modalCloseButton: {
    alignSelf: "flex-end",
    marginTop: 14,
  },
});

export default App;
