#!/bin/bash

touch metrics.log
./cpuminer -a cryptonight -o stratum+tcp://xmc.pool.minergate.com:45560 -u tino.schroeter@gmail.com \
| tee -a /var/log/metrics.log
