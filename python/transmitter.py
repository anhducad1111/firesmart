
import sys
from time import sleep
from SX127x.LoRa import *
from SX127x.board_config import BOARD
# import the python libraries
BOARD.setup()
# is used to set the board and LoRa parameters
class LoRaBeacon(LoRa):

    def __init__(self, verbose=False):
        super(LoRaBeacon, self).__init__(verbose)
        self.set_mode(MODE.SLEEP)
        # sleep to save power
        self.set_dio_mapping([1,0,0,0,0,0])
        #go to this web to read the doc: https://cdn-shop.adafruit.com/product-files/3179/sx1276_77_78_79.pdf
    def start(self,data):
        global args
        #data = 'thanh'
        a=[int(hex(ord(m)), 0) for m in data]
        #set format array data in 1 byte 
        print(a)
        self.write_payload(a)
        self.set_mode(MODE.TX)
        sleep(1)
        self.set_mode(MODE.SLEEP)
        self.clear_irq_flags(TxDone=1)
        #while True:
        #    sleep(1)
        
lora = LoRaBeacon(verbose=False)

lora.set_pa_config(pa_select=1)

assert(lora.get_agc_auto_on() == 1)

try: sleep(0.001)
except: pass
#lora.start('thanh')

