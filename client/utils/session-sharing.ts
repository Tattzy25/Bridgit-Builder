// Session Code Sharing Utilities

export interface ShareData {
  code: string;
  url: string;
  message: string;
}

export class SessionSharing {
  private static baseUrl = window.location.origin;

  // Generate share data for session code
  static generateShareData(code: string): ShareData {
    const url = `${this.baseUrl}/join?code=${code}`;
    const message = `Hey! Join my live Bridgit AI voice session now.\nGo to ${url}\nEnter this code to connect: ${code}`;

    return { code, url, message };
  }

  // Share session code using Web Share API or fallback
  static async shareSession(code: string): Promise<boolean> {
    const shareData = this.generateShareData(code);

    try {
      // Try Web Share API first (mobile/modern browsers)
      if (navigator.share) {
        await navigator.share({
          title: "Join my Bridgit AI session",
          text: shareData.message,
          url: shareData.url,
        });
        console.log("✅ Shared via Web Share API");
        return true;
      } else {
        // Fallback to clipboard copy
        await this.copyToClipboard(shareData.message);
        console.log("✅ Copied to clipboard");
        return true;
      }
    } catch (error) {
      console.error("❌ Share failed:", error);
      return false;
    }
  }

  // Copy text to clipboard
  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        // Modern clipboard API
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const success = document.execCommand("copy");
        document.body.removeChild(textArea);

        return success;
      }
    } catch (error) {
      console.error("❌ Copy to clipboard failed:", error);
      return false;
    }
  }

  // Copy just the session code
  static async copySessionCode(code: string): Promise<boolean> {
    return await this.copyToClipboard(code);
  }

  // Copy full join URL
  static async copyJoinUrl(code: string): Promise<boolean> {
    const shareData = this.generateShareData(code);
    return await this.copyToClipboard(shareData.url);
  }

  // Generate QR code URL (using qr-server.com)
  static generateQRCodeUrl(code: string, size = 200): string {
    const shareData = this.generateShareData(code);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(shareData.url)}`;
  }

  // Parse session code from URL
  static parseSessionCodeFromUrl(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("code");
  }

  // Validate session code format
  static isValidSessionCode(code: string): boolean {
    // 6-digit numeric code
    return /^\d{6}$/.test(code);
  }

  // Format session code for display
  static formatSessionCode(code: string): string {
    // Add spaces for readability: 123456 -> 123 456
    return code.replace(/(\d{3})(\d{3})/, "$1 $2");
  }

  // Generate social media share URLs
  static getSocialShareUrls(code: string) {
    const shareData = this.generateShareData(code);
    const encodedMessage = encodeURIComponent(shareData.message);
    const encodedUrl = encodeURIComponent(shareData.url);

    return {
      whatsapp: `https://wa.me/?text=${encodedMessage}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent("Join my Bridgit AI voice session!")}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent("Join my live voice translation session!")}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      email: `mailto:?subject=${encodeURIComponent("Join my Bridgit AI session")}&body=${encodedMessage}`,
      sms: `sms:?body=${encodedMessage}`,
    };
  }
}
