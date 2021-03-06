precision lowp float;

uniform vec2 resolution;
uniform float time;

// Star Nest by Kali

#define formuparam 0.520
#define stepsize 0.100

#define zoom   0.800
#define tile   0.850
#define speed  0.015 

#define iterations 17
#define volsteps 12
#define brightness 0.0015
#define darkmatter 0.300
#define distfading 0.760
#define saturation 0.800

void main(void)
{
  //get coords and direction
  vec2 uv = gl_FragCoord.xy / resolution.xy - 0.5;
  uv *= 0.8;
  uv.y *= resolution.y / resolution.x;
  vec3 dir = vec3( uv * zoom, 1.0 );
  float time = time * speed + 0.25;// + 0.005 * sin(time);

  // zoom in
  if(time < 1.0)
    dir.xy *= 30.0 - (1.0 - exp(-time*10.0)) * 29.0;

  vec3 from = vec3( 1.0, 0.5, 0.5);
  from += vec3( 0.0, time, -2.0);

  
  //volumetric rendering
  float s = 0.1, fade = 1.0;
  vec3 v = vec3( 0.0 );
  for (int r = 0; r < volsteps; r++) 
  {
    vec3 p = from + s * dir * 0.5;
    p = abs( vec3( tile ) - mod( p, vec3( tile * 2.0 ))); // tiling fold
    float pa, a = pa = 0.0;
    for (int i = 0; i < iterations; i++) 
    {
      p = abs( p ) / dot( p, p ) - formuparam; // the magic formula
      a += abs( length( p ) - pa ); // absolute sum of average change
      pa = length( p );
    }
    float dm = max( 0.0, darkmatter - a * a * 0.001 ); //dark matter
    a *= a * a; // add contrast
    if (r > 3) 
      fade *= 1.0 - dm; // dark matter, don't render near
    //v+=vec3(dm,dm*.5,0.);
    v += fade;
    v += vec3( s, s * s, s*s*s*s ) * a * brightness * fade; // coloring based on distance
    fade *= distfading; // distance fading
    s += stepsize;
  }
  v = mix( vec3( length( v )), v, saturation ); //color adjust
  gl_FragColor = vec4( v * 0.01, 1.0);  
  
}