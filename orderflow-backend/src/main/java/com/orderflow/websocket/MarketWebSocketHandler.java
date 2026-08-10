package com.orderflow.websocket;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketSession;
import reactor.core.publisher.Sinks;

@Component
public class MarketWebSocketHandler implements WebSocketHandler {

    private final Sinks.Many<String> sink =
            Sinks.many().multicast().directBestEffort();

    @Override
    public reactor.core.publisher.Mono<Void> handle(WebSocketSession session) {

        return session.send(
                sink.asFlux()
                        .map(session::textMessage)
        );
    }

    public void broadcast(String message) {
        sink.tryEmitNext(message);
    }
}