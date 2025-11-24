import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
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
    minWidth: 60,
    alignItems: "center",
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
    color: "#ffffff",
    marginBottom: 12,
  },

  modalItem: {
    paddingVertical: 8,
  },

  modalCloseButton: {
    alignSelf: "flex-end",
    marginTop: 14,
  },

  scorersBox: {
  marginTop: 8,
  paddingTop: 8,
  borderTopWidth: 1,
  borderTopColor: "#3a3f47", // va bene anche per light, se vuoi puoi differenziare
  },

  scorersText: {
    fontSize: 13,
    lineHeight: 18,
  },

});
