import SwiftUI
import WebKit

struct WebView: UIViewRepresentable {

    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView()

        // Locate index.html inside the bundled www folder
        if let indexURL = Bundle.main.url(
            forResource: "index",
            withExtension: "html",
            subdirectory: "www"
        ) {
            webView.loadFileURL(indexURL, allowingReadAccessTo: indexURL.deletingLastPathComponent())
        } else {
            print("ERROR: index.html not found in app bundle")
        }

        webView.scrollView.bounces = false
        webView.scrollView.isScrollEnabled = true
        webView.allowsBackForwardNavigationGestures = false

        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {
        // Nothing needed here
    }
}
