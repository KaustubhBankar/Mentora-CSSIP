package com.cdac.cssip.common.security;
import jakarta.servlet.*; import jakarta.servlet.http.*; import org.springframework.security.authentication.UsernamePasswordAuthenticationToken; import org.springframework.security.core.authority.SimpleGrantedAuthority; import org.springframework.security.core.context.SecurityContextHolder; import org.springframework.web.filter.OncePerRequestFilter; import java.io.IOException; import java.util.List;
public class JwtAuthenticationFilter extends OncePerRequestFilter {
 private final JwtTokenService jwt; public JwtAuthenticationFilter(JwtTokenService jwt){this.jwt=jwt;}
 protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain)throws ServletException,IOException{String h=req.getHeader("Authorization"); if(h!=null&&h.startsWith("Bearer ")&&SecurityContextHolder.getContext().getAuthentication()==null){try{AuthenticatedUser u=jwt.parse(h.substring(7)); var a=new UsernamePasswordAuthenticationToken(u,null,List.of(new SimpleGrantedAuthority("ROLE_"+u.role().name()))); SecurityContextHolder.getContext().setAuthentication(a);}catch(Exception ignored){}} chain.doFilter(req,res);}
}
