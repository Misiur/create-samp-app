module.exports = plugins =>
  `echo Executing Server Config...
lanmode 0
rcon_password changeme
maxplayers 50
port 7777
hostname SA-MP 0.3 Server
gamemode0
plugins ${plugins}
announce 0
query 1
weburl www.sa-mp.com
maxnpc 0
onfoot_rate 40
incar_rate 40
weapon_rate 40
stream_distance 300.0
stream_rate 1000`;
