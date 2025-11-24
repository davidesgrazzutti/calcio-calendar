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

  // marcatori
  homeScorers?: string | null;
  awayScorers?: string | null;
}

const API_BASE_URL = "https://calciocalendarapi.onrender.com";
// const API_BASE_URL = "http://localhost:5073";

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>("dark");
  const [fixtures, setFixtures] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // squadra
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [teamSelectorVisible, setTeamSelectorVisible] = useState(false);

  // vista (risultati / in programma)
  const [viewMode, setViewMode] =
    useState<"FINISHED" | "SCHEDULED">("SCHEDULED");
  const [viewModeSelectorVisible, setViewModeSelectorVisible] =
    useState(false);

  // espansione card
  const [expandedMatches, setExpandedMatches] =
    useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedMatches((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isDark = theme === "dark";

  const primaryColor = isDark ? "#66fcf1" : "#003366";
  const leagueColor = isDark ? "#66fcf1" : "#006699";

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  //---------------- FETCH ----------------//
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

  //---------------- LISTA SQUADRE ----------------//
  const teams = React.useMemo(() => {
    const s = new Set<string>();
    fixtures.forEach((f) => {
      s.add(f.homeTeam);
      s.add(f.awayTeam);
    });
    return Array.from(s).sort();
  }, [fixtures]);

  //---------------- FILTRI ----------------//
  const visibleFixtures = React.useMemo(() => {
    let arr = [...fixtures];

    if (viewMode === "FINISHED") {
      arr = arr.filter((f) => f.status === "FINISHED");
    } else {
      arr = arr.filter((f) => f.status === "SCHEDULED");
    }

    if (selectedTeam) {
      arr = arr.filter(
        (f) => f.homeTeam === selectedTeam || f.awayTeam === selectedTeam
      );
    }

    arr.sort((a, b) => {
      if (a.matchday !== b.matchday) return a.matchday - b.matchday;
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });

    if (viewMode === "FINISHED") arr.reverse();

    return arr;
  }, [fixtures, selectedTeam, viewMode]);

  //---------------- RENDER MATCH ----------------//

  const renderMatch = ({ item, index }: { item: Match; index: number }) => {
    const prev = visibleFixtures[index - 1];
    const showDivider = !prev || prev.matchday !== item.matchday;

    const expanded = expandedMatches[item.id] || false;
    const hasResult = item.homeGoals != null && item.awayGoals != null;

    return (
      <View>
        {/* separatore giornata */}
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

        <TouchableOpacity onPress={() => toggleExpand(item.id)}>
          <View
            style={[
              styles.card,
              { backgroundColor: isDark ? "#1f2833" : "#ffffff" },
            ]}
          >
            <Text style={[styles.league, { color: leagueColor }]}>
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

            {/* ESPANSIONE */}
            {expanded && (
              <View
                style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTopWidth: 1,
                  borderTopColor: isDark ? "#3a3f47" : "#cccccc",
                }}
              >
                {hasResult ? (
                  <>
                    {item.homeScorers && (
                      <Text
                        style={{
                          color: isDark ? "#c5c6c7" : "#333333",
                          marginBottom: 4,
                        }}
                      >
                        {item.homeTeam}: {item.homeScorers}
                      </Text>
                    )}
                    {item.awayScorers && (
                      <Text
                        style={{
                          color: isDark ? "#c5c6c7" : "#333333",
                        }}
                      >
                        {item.awayTeam}: {item.awayScorers}
                      </Text>
                    )}
                    {!item.homeScorers && !item.awayScorers && (
                      <Text style={{ color: "#aaa" }}>
                        Marcatori non disponibili
                      </Text>
                    )}
                  </>
                ) : (
                  <Text style={{ color: "#aaa" }}>
                    La partita non è ancora stata giocata
                  </Text>
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>
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

  //---------------- MAIN UI ----------------//

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
          {/* Vista */}
          <TouchableOpacity
            style={[styles.filterButton, { borderColor: primaryColor }]}
            onPress={() => setViewModeSelectorVisible(true)}
          >
            <Text style={{ color: primaryColor }}>
              {viewMode === "FINISHED" ? "Risultati" : "In programma"} ▾
            </Text>
          </TouchableOpacity>

          {/* Squadre */}
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

          {/* Sole/Luna */}
          <TouchableOpacity onPress={toggleTheme} style={{ marginLeft: 10 }}>
            <Text style={{ fontSize: 22 }}>
              {isDark ? "☀️" : "🌙"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* LISTA */}
      <FlatList
        data={visibleFixtures}
        keyExtractor={(i) => i.id}
        renderItem={renderMatch}
        contentContainerStyle={styles.listContent}
      />

      {/* MODALE VISTA */}
      <Modal
        visible={viewModeSelectorVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setViewModeSelectorVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleziona vista</Text>

            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setViewMode("SCHEDULED");
                setViewModeSelectorVisible(false);
              }}
            >
              <Text
                style={{
                  color:
                    viewMode === "SCHEDULED" ? primaryColor : "#ffffff",
                  fontWeight:
                    viewMode === "SCHEDULED" ? "700" : "400",
                }}
              >
                In programma
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setViewMode("FINISHED");
                setViewModeSelectorVisible(false);
              }}
            >
              <Text
                style={{
                  color:
                    viewMode === "FINISHED" ? primaryColor : "#ffffff",
                  fontWeight:
                    viewMode === "FINISHED" ? "700" : "400",
                }}
              >
                Risultati
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setViewModeSelectorVisible(false)}
            >
              <Text style={{ color: primaryColor }}>Chiudi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODALE SQUADRE */}
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
              <Text style={{ color: primaryColor }}>Chiudi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default App;
