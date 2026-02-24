"use client";

import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import { Character, Stat } from "@/app/characters/[id]/page"; // Убедись, что Stat импортирован

const mod = (v: number) => Math.floor((v - 10) / 2);

// ← ИСПРАВЛЕНИЕ: типизированный массив
const statsOrder: Stat[] = ["str", "dex", "con", "int", "wis", "cha"];

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica", // Встроенный шрифт — работает всегда
    backgroundColor: "#fff",
    color: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    borderBottom: 2,
    borderColor: "#000",
    paddingBottom: 5,
  },
  charName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  classLevel: {
    fontSize: 14,
  },
  background: { fontSize: 12 },
  playerName: { fontSize: 12 },
  race: { fontSize: 12 },
  alignment: { fontSize: 12 },
  experience: { fontSize: 12 },

  statsBlock: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  statBox: {
    alignItems: "center",
    width: 80,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    marginVertical: 5,
  },
  statMod: {
    fontSize: 18,
    fontWeight: "bold",
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#000",
    textAlign: "center",
    lineHeight: 26,
  },
  statName: { fontSize: 10, fontWeight: "bold" },

  hpBox: {
    alignItems: "center",
    marginTop: 20,
  },
  hpCurrent: {
    fontSize: 40,
    fontWeight: "bold",
  },
  hpMax: {
    fontSize: 20,
  },
});

const OfficialCharacterSheetPDF = ({ char }: { char: Character }) => {
  const profBonus = 2 + Math.floor((char.level - 1) / 4);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Верхняя часть */}
        <View style={styles.header}>
          <View>
            <Text style={styles.charName}>{char.name || "Имя персонажа"}</Text>
            <Text style={styles.classLevel}>
              {char.class || "Класс"} {char.level} {char.subclass ? `(${char.subclass})` : ""}
            </Text>
            <Text style={styles.background}>
              {char.race || "Раса"} • {char.background || "Предыстория"}
            </Text>
          </View>
          <View>
            <Text style={styles.playerName}>Игрок: {char.playerName || "Игрок"}</Text>
            <Text style={styles.experience}>Опыт: {char.experience || 0}</Text>
          </View>
        </View>

        {/* Характеристики — ИСПРАВЛЕНО */}
        <View style={styles.statsBlock}>
          {statsOrder.map((stat) => (
            <View key={stat} style={styles.statBox}>
              <Text style={styles.statName}>
                {stat === "str" ? "СИЛА" :
                 stat === "dex" ? "ЛОВК" :
                 stat === "con" ? "ТЕЛ" :
                 stat === "int" ? "ИНТ" :
                 stat === "wis" ? "МУДР" : "ХАР"}
              </Text>
              <Text style={styles.statMod}>
                {mod(char.stats[stat]) >= 0 ? "+" : ""}{mod(char.stats[stat])}
              </Text>
              <Text style={styles.statValue}>{char.stats[stat]}</Text>
            </View>
          ))}
        </View>

        {/* Хиты */}
        <View style={styles.hpBox}>
          <Text style={styles.hpCurrent}>{char.hp.current}</Text>
          <Text style={styles.hpMax}>
            / {char.hp.max + (char.hp.bonusMax || 0)} (макс.)
          </Text>
          <Text>Кость хитов: d{char.hitDie || 10}</Text>
          <Text>Временные ОД: {char.hp.temp || 0}</Text>
        </View>

        {/* Здесь можно добавить спасброски, навыки, КЗ, скорость и т.д. */}
      </Page>
    </Document>
  );
};

export const generateOfficialPDF = async (char: Character) => {
  const blob = await pdf(<OfficialCharacterSheetPDF char={char} />).toBlob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");

  // URL.revokeObjectURL(url); // Не отзываем — пусть вкладка работает
};