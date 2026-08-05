package com.cdac.cssip.common.security;
import com.cdac.cssip.common.enums.Role;
import io.jsonwebtoken.*; import io.jsonwebtoken.io.Decoders; import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey; import java.util.*;
public class JwtTokenService {
 private final SecretKey key; private final long expiration;
 public JwtTokenService(String secret,long expiration){this.key=Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));this.expiration=expiration;}
 public String generate(Long userId,String cdacId,String fullName,Role role){return Jwts.builder().subject(cdacId).claim("userId",userId).claim("fullName",fullName).claim("role",role.name()).issuedAt(new Date()).expiration(new Date(System.currentTimeMillis()+expiration)).signWith(key).compact();}
 public AuthenticatedUser parse(String token){Claims c=Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload(); return new AuthenticatedUser(c.get("userId",Long.class),c.getSubject(),c.get("fullName",String.class),Role.valueOf(c.get("role",String.class)));}
}
