'use client';

import { useState } from 'react';
import { FaMapMarkerAlt, FaCalendarAlt, FaUser, FaChevronDown, FaSearch } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const LOCATIONS = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Huế'];
const GUEST_OPTIONS = ['1 Người lớn', '2 Người lớn, 2 Trẻ em', '3 Người lớn'];

export default function FlightSearchCard() {
  const [location, setLocation] = useState('Hồ Chí Minh');
  const [guests, setGuests] = useState('2 Người lớn, 2 Trẻ em');
  const [openDropdown, setOpenDropdown] = useState<null | 'location' | 'guest' | 'date'>(null);

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date('2025-07-25'),
      endDate: new Date('2025-07-31'),
      key: 'selection',
    },
  ]);

  const toggleDropdown = (type: 'location' | 'guest' | 'date') => {
    setOpenDropdown(openDropdown === type ? null : type);
  };

  const checkIn = format(dateRange[0].startDate, 'dd/MM/yyyy');
  const checkOut = format(dateRange[0].endDate, 'dd/MM/yyyy');
  const isValid = location && checkIn && checkOut && guests;

  return (
    <div className="max-w-[1200px] mx-auto w-full">
      {/* Horizontal layout */}
      <div className="w-full flex flex-wrap justify-center gap-6 mb-6">
        {['Khách sạn', 'Vé máy bay', 'Đưa đón sân bay', 'Cho thuê xe', 'Hoạt động'].map(
          (item, idx) => (
            <div
              key={idx}
              className="px-8 py-5 rounded-2xl bg-white shadow text-[#29b8b1] font-bold text-lg cursor-pointer hover:shadow-lg transition-all duration-300"
            >
              {item}
            </div>
          )
        )}
      </div>

      <div className="w-full flex flex-wrap xl:flex-nowrap items-end gap-4 text-sm xl:text-base">
        {/* Location */}
        <div className="relative flex-1 min-w-[240px]">
          <label className="text-gray-700 text-sm font-medium mb-1 block">Location</label>
          <div
            className="flex items-center justify-between px-4 py-3 border rounded-xl bg-white shadow-sm cursor-pointer"
            onClick={() => toggleDropdown('location')}
          >
            <div className="flex items-center gap-2 text-gray-800 font-semibold whitespace-nowrap">
              <FaMapMarkerAlt className="text-gray-400" />
              <span>{location}</span>
            </div>
            <FaChevronDown className="text-gray-500" />
          </div>

          <AnimatePresence>
            {openDropdown === 'location' && (
              <motion.ul
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-10 top-full mt-2 bg-white border rounded-xl shadow-lg w-full"
              >
                {LOCATIONS.map((loc) => (
                  <li
                    key={loc}
                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setLocation(loc);
                      setOpenDropdown(null);
                    }}
                  >
                    {loc}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* Date Picker */}
        <div className="relative flex-1 min-w-[240px] border-l xl:pl-6">
          <label className="text-gray-700 text-sm font-medium mb-1 block">
            Check In - Check Out
          </label>
          <div
            className="px-4 py-3 border rounded-xl bg-white shadow-sm cursor-pointer flex items-center justify-between gap-2"
            onClick={() => toggleDropdown('date')}
          >
            <div className="flex items-center gap-2 text-base font-semibold text-gray-900 whitespace-nowrap">
              <span>{checkIn}</span>
              <span>→</span>
              <span>{checkOut}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-gray-400" />
              <FaChevronDown className="text-gray-500" />
            </div>
          </div>

          <AnimatePresence>
            {openDropdown === 'date' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-20 mt-2 shadow-lg bg-white rounded-xl overflow-hidden"
              >
                <DateRange
                  ranges={dateRange}
                  onChange={(item) =>
                    setDateRange([
                      {
                        startDate: item.selection.startDate ?? new Date(),
                        endDate: item.selection.endDate ?? new Date(),
                        key: item.selection.key ?? 'selection',
                      },
                    ])
                  }
                  moveRangeOnFirstSelection={false}
                  rangeColors={['#29b8b1']}
                  minDate={new Date()}
                  className="p-2"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Guest */}
        <div className="relative flex-1 min-w-[240px] border-l xl:pl-6">
          <label className="text-gray-700 text-sm font-medium mb-1 block">Guest</label>
          <div
            className="flex items-center justify-between px-4 py-3 border rounded-xl bg-white shadow-sm cursor-pointer"
            onClick={() => toggleDropdown('guest')}
          >
            <div className="flex items-center gap-2 text-gray-800 font-semibold whitespace-nowrap">
              <FaUser className="text-gray-400" />
              <span>{guests}</span>
            </div>
            <FaChevronDown className="text-gray-500" />
          </div>

          <AnimatePresence>
            {openDropdown === 'guest' && (
              <motion.ul
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-10 top-full mt-2 bg-white border rounded-xl shadow-lg w-full"
              >
                {GUEST_OPTIONS.map((g) => (
                  <li
                    key={g}
                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setGuests(g);
                      setOpenDropdown(null);
                    }}
                  >
                    {g}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* Search Button */}
        <div className="mt-7 xl:mt-0 xl:ml-6">
          <button
            className={`flex items-center px-8 py-4 text-white font-semibold rounded-full transition ${
              isValid ? 'bg-black hover:opacity-90' : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={!isValid}
          >
            <FaSearch className="mr-2" />
            Tìm kiếm
          </button>
        </div>
      </div>
    </div>
  );
}
