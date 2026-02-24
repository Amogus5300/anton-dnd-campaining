"use client";

import { pdf, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { Character, Stat } from "@/app/characters/[id]/page";



// ← Импортируем шрифты как модули (это важно!)
import { Font } from "@react-pdf/renderer";

Font.register({
  family: "Roboto",  // ← только одно имя семьи!
  fonts: [
    {
      src: "/fonts/Roboto-Regular.ttf",
      fontWeight: "normal",   // или 400
      fontStyle: "normal",
    },
    {
      src: "/fonts/Roboto-Bold.ttf",
      fontWeight: "bold",     // или 700
      fontStyle: "normal",
    },
  ],
});

const mod = (v: number) => Math.floor((v - 10) / 2);

const styles = StyleSheet.create({
  page: {
    padding: 35,
    fontFamily: "Roboto",           // основной шрифт
    fontSize: 10,
    backgroundColor: "#fff",
    color: "#000",
  },

  topFrame: {
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 4,
    padding: 14,
    marginBottom: 25,
    width: "68%",
  },
  fullRow: { marginBottom: 14 },
  halfRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  column: { width: "48%" },
  field: { marginBottom: 10 },
  value: { fontSize: 14, fontFamily: "Roboto", marginBottom: 3 },
  label: { fontSize: 7, color: "#555", textTransform: "uppercase", letterSpacing: 1 },
  line: { height: 1, backgroundColor: "#000", marginTop: 2 },

  levelCircle: {
    width: 105,
    height: 105,
    borderRadius: 53,
    borderWidth: 3,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: -20,
    top: 20,
  },
});

const ClassicCharacterSheetPDF = ({ char }: { char: Character }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={{ flexDirection: "row", position: "relative" }}>
          {/* Рамка с 5 строками */}
          <View style={styles.topFrame}>
            <View style={styles.fullRow}>
              <Text style={styles.value}>{char.name || "Корво Аттано"}</Text>
              <Text style={styles.label}>ИМЯ ПЕРСОНАЖА</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.halfRow}>
              <View style={styles.column}>
                <View style={styles.field}>
                  <Text style={styles.value}>{char.background || "Беспризорник"}</Text>
                  <Text style={styles.label}>ПРЕДЫСТОРИЯ</Text>
                  <View style={styles.line} />
                </View>
                <View style={styles.field}>
                  <Text style={styles.value}>{char.race || "Человек"}</Text>
                  <Text style={styles.label}>РАСА</Text>
                  <View style={styles.line} />
                </View>
              </View>

              <View style={styles.column}>
                <View style={styles.field}>
                  <Text style={styles.value}>{char.class || "Воин"}</Text>
                  <Text style={styles.label}>КЛАСС</Text>
                  <View style={styles.line} />
                </View>
                <View style={styles.field}>
                  <Text style={styles.value}>{char.subclass || "Рунный рыцарь"}</Text>
                  <Text style={styles.label}>ПОДКЛАСС</Text>
                  <View style={styles.line} />
                </View>
              </View>
            </View>
          </View>

          {/* Круг уровня */}
          <View style={styles.levelCircle}>
            <Text style={{ fontSize: 42, fontFamily: "Roboto" }}>
              {char.level || 9}
            </Text>
            <Text style={{ fontSize: 9, marginTop: -8 }}>УРОВЕНЬ</Text>
            <View style={{ height: 1, backgroundColor: "#000", width: 65, marginVertical: 6 }} />
            <Text style={{ fontSize: 14, fontFamily: "Roboto" }}>
              {char.experience?.toLocaleString() || "48000"}
            </Text>
            <Text style={{ fontSize: 9 }}>ОПЫТ</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export const generatePDF = async (char: Character) => {
  try {
    const blob = await pdf(<ClassicCharacterSheetPDF char={char} />).toBlob();
    const url = URL.createObjectURL(blob);
    window.location.href = url;
  } catch (error) {
    console.error("Ошибка генерации PDF:", error);
    alert("Не удалось создать PDF. Ошибка: " + (error as Error).message);
  }
};