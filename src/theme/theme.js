// src/theme/index.js
import { extendTheme } from "@chakra-ui/react";

// Importação dos estilos dos componentes
import { CardComponent } from "./additions/card/card";
import { buttonStyles } from "./components/button";
import { badgeStyles } from "./components/badge";
import { inputStyles } from "./components/input";
import { progressStyles } from "./components/progress";
import { sliderStyles } from "./components/slider";
import { textareaStyles } from "./components/textarea";
import { switchStyles } from "./components/switch";
import { linkStyles } from "./components/link";

// Importação dos breakpoints e estilos globais
import { breakpoints } from "./foundations/breakpoints";
import { globalStyles } from "./styles";

// Configuração do tema
const theme = extendTheme({
  breakpoints, // Definição dos breakpoints

  styles: {
    global: {
      ...globalStyles, // Inclui estilos globais adicionais
      "html, body": {
        backgroundColor: "white", // Define o fundo branco para toda a aplicação
        color: "gray.800", // Define a cor de texto padrão
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
      },
      "*": {
        boxSizing: "inherit",
      },
    },
  },

  components: {
    Badge: badgeStyles, // Estilos personalizados para Badge
    Button: buttonStyles, // Estilos personalizados para Button
    Link: linkStyles, // Estilos personalizados para Link
    Progress: progressStyles, // Estilos personalizados para Progress
    Slider: sliderStyles, // Estilos personalizados para Slider
    Input: inputStyles, // Estilos personalizados para Input
    Textarea: textareaStyles, // Estilos personalizados para Textarea
    Switch: switchStyles, // Estilos personalizados para Switch
    Card: CardComponent, // Estilos personalizados para Card
  },
});

export default theme;
