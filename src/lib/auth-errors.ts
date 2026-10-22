/**
 * Helper to translate Firebase Auth errors into friendly messages (Spanish/English).
 */
export function getFriendlyAuthErrorMessage(error: unknown, locale: "es" | "en" = "es"): string {
  if (!error) return "";

  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: string }).code)
      : typeof error === "string"
      ? error
      : error instanceof Error
      ? error.message
      : "";

  if (locale === "en") {
    switch (code) {
      case "auth/email-already-in-use":
        return "This email is already registered. Please sign in instead.";
      case "auth/invalid-email":
        return "The email format is invalid.";
      case "auth/weak-password":
        return "The password is too weak. Please use at least 6 characters.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/invalid-credential":
        return "Incorrect email or password. Please verify your credentials.";
      case "auth/too-many-requests":
        return "Access temporarily blocked due to many failed attempts. Try again later.";
      case "auth/popup-closed-by-user":
        return "Google sign-in window was closed.";
      case "auth/popup-blocked":
        return "Google sign-in popup was blocked by your browser.";
      case "auth/network-request-failed":
        return "Network error. Please check your internet connection.";
      case "auth/passwords-mismatch":
        return "Passwords do not match. Please verify.";
      default:
        return error instanceof Error ? error.message : "Authentication error occurred.";
    }
  }

  // Spanish (default)
  switch (code) {
    case "auth/email-already-in-use":
      return "Este correo ya está registrado. Por favor selecciona 'Iniciar sesión'.";
    case "auth/invalid-email":
      return "El formato del correo electrónico no es válido.";
    case "auth/weak-password":
      return "La contraseña es demasiado corta. Debe tener al menos 6 caracteres.";
    case "auth/user-not-found":
      return "No existe ninguna cuenta registrada con este correo electrónico.";
    case "auth/wrong-password":
      return "Contraseña incorrecta. Por favor inténtalo de nuevo.";
    case "auth/invalid-credential":
      return "Correo o contraseña incorrectos. Verifica tus credenciales.";
    case "auth/too-many-requests":
      return "Demasiados intentos fallidos. Por seguridad, inténtalo más tarde.";
    case "auth/popup-closed-by-user":
      return "Se canceló la ventana de inicio de sesión con Google.";
    case "auth/popup-blocked":
      return "El navegador bloqueó la ventana emergente de Google. Por favor permítela.";
    case "auth/network-request-failed":
      return "Error de conexión. Por favor verifica tu conexión a internet.";
    case "auth/passwords-mismatch":
      return "Las contraseñas no coinciden. Por favor verifícalas.";
    default:
      if (typeof error === "string") return error;
      if (error instanceof Error) {
        if (error.message.includes("auth/")) {
          return "Ocurrió un error de autenticación. Por favor verifica tus datos.";
        }
        return error.message;
      }
      return "Ocurrió un error inesperado al procesar la solicitud.";
  }
}
